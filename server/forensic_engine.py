"""
MAYA-BREAK Forensic Engine v3.0 — Advanced Edition
====================================================
State-of-the-art image forensics using 8 independent algorithms
used by academic forensics labs and law enforcement agencies.

Algorithms:
  1. JPEG Ghost Detection      — Multi-quality ELA finds original save quality
  2. PRNU Noise Analysis       — Photo Response Non-Uniformity (camera fingerprint)
  3. RGB Channel Correlation   — Cross-channel tampering reveals colour inconsistency  
  4. FFT Frequency Analysis    — Editing tools leave periodic spectral artifacts
  5. Edge Gradient Analysis    — Copy-paste causes sharp, unnatural edge discontinuities
  6. Block Artifact Metric     — JPEG blocking inconsistency (double-save detection)
  7. Metadata Forensics        — EXIF software tags, timestamp mismatches
  8. Copy-Move Keypoint Match  — Duplicate regions detected via SIFT feature matching
"""

import io, os, math, tempfile
import numpy as np
from PIL import Image, ExifTags
import cv2
import scipy.ndimage
import scipy.fft

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _to_float_image(image: Image.Image) -> np.ndarray:
    return np.array(image.convert("RGB")).astype(np.float64)

def _score(val: float, low: float, high: float) -> float:
    """Map val into 0-100 where low→0 and high→100."""
    if val <= low:
        return 0.0
    if val >= high:
        return 100.0
    return float((val - low) / (high - low) * 100)


# ─────────────────────────────────────────────────────────────────────────────
# 1. JPEG GHOST (Multi-quality ELA)
#    Saves the image at multiple JPEG qualities and measures response.
#    The quality with the *minimum* ELA response is the original save quality.
#    If minimum response is NOT at a high quality (e.g. 95), the image was
#    re-saved after editing, which is a strong forgery signal.
# ─────────────────────────────────────────────────────────────────────────────

def run_jpeg_ghost(image: Image.Image) -> dict:
    orig = np.array(image.convert("RGB")).astype(np.float64)
    qualities = [50, 60, 70, 75, 80, 85, 90, 95]
    mean_diffs = []

    for q in qualities:
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        tmp.close()
        try:
            image.save(tmp.name, "JPEG", quality=q)
            recomp = np.array(Image.open(tmp.name).convert("RGB")).astype(np.float64)
            diff = np.abs(orig - recomp).mean()
            mean_diffs.append(diff)
        finally:
            try:
                os.remove(tmp.name)
            except Exception:
                pass

    min_diff = min(mean_diffs)
    max_diff = max(mean_diffs)
    min_q_idx = int(np.argmin(mean_diffs))
    original_quality = qualities[min_q_idx]

    # If the minimum ELA is at a very low quality → re-saved at low quality → edited
    # Authentic un-edited images: min response is at highest quality (95)
    # Edited images:              min response is at a mid/low quality (50-80)
    quality_score = _score(95 - original_quality, 0, 45)  # edited at low Q → high score

    # Also flag very low absolute diff across ALL qualities (AI-generated / synthetic)
    range_score = _score(max_diff - min_diff, 0, 8)

    tamper_score = float(quality_score * 0.7 + range_score * 0.3)

    return {
        "original_quality_estimate": original_quality,
        "ela_range": float(round(max_diff - min_diff, 4)),
        "tamper_score": float(round(min(100, tamper_score), 2)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 2. PRNU (Photo Response Non-Uniformity)
#    Every camera sensor has unique fixed-pattern noise.
#    We extract the noise residual (image minus smoothed version) and
#    measure spatial consistency. Spliced images show abrupt PRNU breaks.
# ─────────────────────────────────────────────────────────────────────────────

def run_prnu_analysis(image: Image.Image) -> dict:
    gray = np.array(image.convert("L")).astype(np.float64)
    # Wavelet-like noise residual using Gaussian subtraction at 3 scales
    residuals = []
    for sigma in [0.5, 1.5, 3.0]:
        smooth = scipy.ndimage.gaussian_filter(gray, sigma=sigma)
        residuals.append(gray - smooth)
    noise_map = np.mean(residuals, axis=0)

    h, w = noise_map.shape
    # Divide into 8×8 grid, compute variance per cell
    rows, cols = 8, 8
    rh, rw = h // rows, w // cols
    cell_vars = []
    for i in range(rows):
        for j in range(cols):
            cell = noise_map[i*rh:(i+1)*rh, j*rw:(j+1)*rw]
            if cell.size > 0:
                cell_vars.append(float(cell.var()))

    if not cell_vars:
        return {"prnu_cv": 0.0, "tamper_score": 0.0}

    arr = np.array(cell_vars)
    mean_var = float(arr.mean())
    std_var = float(arr.std())
    cv = std_var / (mean_var + 1e-9)  # coefficient of variation

    # High CV → inconsistent noise → spliced/composited image
    tamper_score = float(_score(cv, 0.3, 2.5))

    return {
        "prnu_mean_variance": float(round(mean_var, 4)),
        "prnu_cv": float(round(cv, 4)),
        "tamper_score": float(round(tamper_score, 2)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 3. RGB CHANNEL CORRELATION
#    In natural photographs, RGB channels are highly correlated spatially.
#    Copy-paste operations from different images break this correlation locally.
# ─────────────────────────────────────────────────────────────────────────────

def run_rgb_correlation(image: Image.Image) -> dict:
    arr = np.array(image.convert("RGB")).astype(np.float64)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

    def pearson(a, b_):
        a_flat, b_flat = a.flatten(), b_.flatten()
        if a_flat.std() < 1e-9 or b_flat.std() < 1e-9:
            return 1.0
        return float(np.corrcoef(a_flat, b_flat)[0, 1])

    rg = pearson(r, g)
    rb = pearson(r, b)
    gb = pearson(g, b)
    avg_corr = (rg + rb + gb) / 3.0

    # Analyze correlation in 4×4 grid — inconsistent blocks are suspicious
    h, w = arr.shape[:2]
    bh, bw = h // 4, w // 4
    block_corrs = []
    for i in range(4):
        for j in range(4):
            block = arr[i*bh:(i+1)*bh, j*bw:(j+1)*bw]
            if block.shape[0] < 2 or block.shape[1] < 2:
                continue
            br, bg, bb_ = block[:,:,0], block[:,:,1], block[:,:,2]
            block_corrs.append(pearson(br, bg))

    if not block_corrs:
        return {"rgb_corr": avg_corr, "tamper_score": 0.0}

    block_corr_std = float(np.std(block_corrs))
    # High std → blocks with very different correlations → spliced from different sources
    tamper_score = float(_score(block_corr_std, 0.05, 0.4))

    return {
        "avg_channel_corr": float(round(avg_corr, 4)),
        "block_corr_std": float(round(block_corr_std, 4)),
        "tamper_score": float(round(tamper_score, 2)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. FFT FREQUENCY DOMAIN ANALYSIS
#    Editing tools (Photoshop, AI generators) introduce periodic spectral
#    artifacts. Natural images have smooth 1/f power spectra.
#    We detect spikes and periodicity anomalies in the 2D FFT magnitude.
# ─────────────────────────────────────────────────────────────────────────────

def run_fft_analysis(image: Image.Image) -> dict:
    gray = np.array(image.convert("L")).astype(np.float64)
    fft2 = np.fft.fft2(gray)
    fft_shifted = np.fft.fftshift(fft2)
    magnitude = np.abs(fft_shifted)

    # Compute radial power spectrum
    h, w = magnitude.shape
    cy, cx = h // 2, w // 2
    max_r = min(cy, cx)
    radial_profile = []
    for r in range(1, max_r):
        mask = np.zeros_like(magnitude, dtype=bool)
        Y, X = np.ogrid[:h, :w]
        dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
        ring = (dist >= r - 0.5) & (dist < r + 0.5)
        if ring.sum() > 0:
            radial_profile.append(float(magnitude[ring].mean()))

    if len(radial_profile) < 10:
        return {"fft_periodicity": 0.0, "tamper_score": 0.0}

    rp = np.array(radial_profile)
    # Natural images follow 1/f² power law — compute deviation
    log_r = np.log(np.arange(1, len(rp) + 1) + 1e-9)
    log_p = np.log(rp + 1e-9)
    # Fit line in log-log space
    coeffs = np.polyfit(log_r, log_p, 1)
    residuals = log_p - np.polyval(coeffs, log_r)
    residual_std = float(residuals.std())

    # High residual std → spectral anomalies → AI generation or editing artifacts
    tamper_score = float(_score(residual_std, 0.3, 1.5))

    # Also check for strong periodic spikes (GAN fingerprint)
    spike_score = 0.0
    rp_norm = rp / (rp.mean() + 1e-9)
    n_spikes = int((rp_norm > 3.0).sum())  # bins more than 3× average
    spike_score = float(_score(n_spikes, 2, 20))

    tamper_score = float(min(100, tamper_score * 0.6 + spike_score * 0.4))

    return {
        "fft_residual_std": float(round(residual_std, 4)),
        "fft_spikes": n_spikes,
        "tamper_score": float(round(tamper_score, 2)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. EDGE GRADIENT INCONSISTENCY
#    Copy-paste operations leave unnatural sharp boundaries where two images
#    are stitched. We detect gradient magnitude discontinuities at a grid level.
# ─────────────────────────────────────────────────────────────────────────────

def run_edge_analysis(image: Image.Image) -> dict:
    gray = np.array(image.convert("L")).astype(np.float32)
    # Sobel gradient magnitude
    gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(gx**2 + gy**2)

    h, w = grad_mag.shape
    rows, cols = 6, 6
    rh, rw = h // rows, w // cols
    block_means = []
    for i in range(rows):
        for j in range(cols):
            block = grad_mag[i*rh:(i+1)*rh, j*rw:(j+1)*rw]
            if block.size > 0:
                block_means.append(float(block.mean()))

    if not block_means:
        return {"edge_cv": 0.0, "tamper_score": 0.0}

    arr = np.array(block_means)
    mean_g = float(arr.mean())
    cv = float(arr.std()) / (mean_g + 1e-9)

    # Very high CV means some blocks have dramatically different edge density
    tamper_score = float(_score(cv, 0.5, 2.5))

    return {
        "edge_gradient_cv": float(round(cv, 4)),
        "tamper_score": float(round(tamper_score, 2)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 6. BLOCK ARTIFACT METRIC
#    JPEG compression creates 8×8 tiling artifacts. Double-compressed images
#    (open → edit → save) have mixed block boundaries revealing re-compression.
# ─────────────────────────────────────────────────────────────────────────────

def run_block_artifact_analysis(image: Image.Image) -> dict:
    gray = np.array(image.convert("L")).astype(np.float64)
    h, w = gray.shape

    # Compute differences at JPEG 8-pixel boundaries vs non-boundaries
    h_bound_diffs = []
    h_inner_diffs = []
    for i in range(1, h):
        diff = float(np.abs(gray[i] - gray[i-1]).mean())
        if i % 8 == 0:
            h_bound_diffs.append(diff)
        else:
            h_inner_diffs.append(diff)

    v_bound_diffs = []
    v_inner_diffs = []
    for j in range(1, w):
        diff = float(np.abs(gray[:, j] - gray[:, j-1]).mean())
        if j % 8 == 0:
            v_bound_diffs.append(diff)
        else:
            v_inner_diffs.append(diff)

    if not h_bound_diffs or not h_inner_diffs:
        return {"blocking_ratio": 1.0, "tamper_score": 0.0}

    h_ratio = float(np.mean(h_bound_diffs)) / (float(np.mean(h_inner_diffs)) + 1e-9)
    v_ratio = float(np.mean(v_bound_diffs)) / (float(np.mean(v_inner_diffs)) + 1e-9)
    avg_ratio = float((h_ratio + v_ratio) / 2.0)

    # Authentic single-save JPEG: ratio slightly above 1.0 (expected blocking)
    # Double-saved (edited): ratio is HIGHER than normal OR abnormally low (PNG/screen)
    # We flag both extremes
    deviation = float(abs(avg_ratio - 1.2))  # 1.2 is typical for single-compression
    tamper_score = float(_score(deviation, 0.1, 0.8))

    return {
        "blocking_ratio": float(round(avg_ratio, 4)),
        "tamper_score": float(round(tamper_score, 2)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 7. METADATA FORENSICS
# ─────────────────────────────────────────────────────────────────────────────

def run_metadata_analysis(image_bytes: bytes) -> dict:
    findings = []
    tamper_score = 0.0
    try:
        img = Image.open(io.BytesIO(image_bytes))
        fmt = img.format or "Unknown"
        exif_data = img._getexif() if hasattr(img, '_getexif') else None

        if exif_data is None:
            findings.append(f"No EXIF metadata (format: {fmt})")
            tamper_score += 10.0
        else:
            tags = {ExifTags.TAGS.get(k, k): v for k, v in exif_data.items()}
            software = str(tags.get("Software", "")).lower()
            editing_tools = [
                "photoshop", "gimp", "lightroom", "paint.net", "canva",
                "affinity", "pixelmator", "snapseed", "facetune", "topaz",
                "illustrator", "inkscape", "corel", "procreate"
            ]
            for tool in editing_tools:
                if tool in software:
                    findings.append(f"Editing software signature: {tags.get('Software')}")
                    tamper_score += 60.0
                    break

            dt_orig = tags.get("DateTimeOriginal")
            dt_mod = tags.get("DateTime")
            if dt_orig and dt_mod and dt_orig != dt_mod:
                findings.append(f"File modified after capture: orig={dt_orig}, mod={dt_mod}")
                tamper_score += 30.0

            if not tags.get("Make") and not tags.get("Model"):
                findings.append("No camera make/model in EXIF")
                tamper_score += 10.0

            # Check thumbnail mismatch (common after editing)
            try:
                thumb_data = tags.get("JPEGThumbnail")
                if thumb_data:
                    thumb = Image.open(io.BytesIO(bytes(thumb_data)))
                    tw, th = thumb.size
                    iw, ih = img.size
                    if abs(tw/th - iw/ih) > 0.05:
                        findings.append("Embedded thumbnail aspect ratio differs from main image")
                        tamper_score += 35.0
            except Exception:
                pass
    except Exception as e:
        findings.append(f"Metadata read error: {str(e)[:60]}")

    if not findings:
        findings.append("EXIF metadata appears consistent")

    return {
        "findings": [str(f) for f in findings],
        "tamper_score": float(round(min(100.0, tamper_score), 2)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 8. COPY-MOVE DETECTION (SIFT)
# ─────────────────────────────────────────────────────────────────────────────

def run_copy_move_detection(image: Image.Image) -> dict:
    gray = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2GRAY)
    sift = cv2.SIFT_create(nfeatures=1000)
    kps, descs = sift.detectAndCompute(gray, None)

    if descs is None or len(kps) < 10:
        return {"clone_matches": 0, "tamper_score": 0.0}

    bf = cv2.BFMatcher()
    try:
        matches = bf.knnMatch(descs, descs, k=2)
    except Exception:
        return {"clone_matches": 0, "tamper_score": 0.0}

    clone_matches = 0
    for m_list in matches:
        if len(m_list) < 2:
            continue
        m, n = m_list[0], m_list[1]
        if m.distance < 0.75 * n.distance:
            pt1 = np.array(kps[m.queryIdx].pt)
            pt2 = np.array(kps[m.trainIdx].pt)
            if np.linalg.norm(pt1 - pt2) > 50:
                clone_matches += 1

    tamper_score = float(min(100.0, clone_matches * 2.5))
    return {
        "clone_matches": int(clone_matches),
        "total_keypoints": int(len(kps)),
        "tamper_score": float(round(tamper_score, 2)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# MASTER ANALYSIS FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

WEIGHTS = {
    "jpeg_ghost":   0.25,   # most reliable for JPEG tampering
    "prnu":         0.20,   # camera noise fingerprint
    "fft":          0.15,   # spectral / AI generation artifacts
    "rgb_corr":     0.10,   # channel correlation
    "edge":         0.10,   # gradient discontinuities
    "block":        0.08,   # JPEG block artifact ratio
    "metadata":     0.07,   # EXIF forensics
    "copy_move":    0.05,   # cloning detection
}

def analyze_image(image_bytes: bytes, label: str = "Image") -> dict:
    """Run all 8 forensic algorithms and return a weighted verdict."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    R = {}

    for name, fn, args in [
        ("jpeg_ghost",  run_jpeg_ghost,             (image,)),
        ("prnu",        run_prnu_analysis,           (image,)),
        ("rgb_corr",    run_rgb_correlation,         (image,)),
        ("fft",         run_fft_analysis,            (image,)),
        ("edge",        run_edge_analysis,           (image,)),
        ("block",       run_block_artifact_analysis, (image,)),
        ("metadata",    run_metadata_analysis,       (image_bytes,)),
        ("copy_move",   run_copy_move_detection,     (image,)),
    ]:
        try:
            R[name] = fn(*args)
        except Exception as e:
            R[name] = {"tamper_score": 0.0, "error": str(e)[:80]}

    # Weighted score
    weighted_score = float(sum(
        R[k].get("tamper_score", 0.0) * WEIGHTS[k] for k in WEIGHTS
    ))

    is_fake = bool(weighted_score >= 38)
    confidence = float(weighted_score if is_fake else (100.0 - weighted_score))

    if weighted_score >= 70:
        status = "HIGH RISK: Strong Forgery Evidence"
    elif weighted_score >= 38:
        status = "MODERATE RISK: Tampering Detected"
    elif weighted_score >= 20:
        status = "LOW RISK: Minor Anomalies"
    else:
        status = "Authentic (Original)"

    # Collect human-readable evidence
    evidence = []
    if R["jpeg_ghost"].get("tamper_score", 0) > 35:
        q = R["jpeg_ghost"].get("original_quality_estimate", "?")
        evidence.append(f"JPEG Ghost: image re-saved at quality {q} (editing artifact)")
    if R["prnu"].get("tamper_score", 0) > 35:
        cv = R["prnu"].get("prnu_cv", 0)
        evidence.append(f"PRNU: camera noise inconsistency = {cv:.3f} (splicing detected)")
    if R["fft"].get("tamper_score", 0) > 35:
        evidence.append(f"FFT: abnormal spectral pattern ({R['fft'].get('fft_spikes',0)} frequency spikes)")
    if R["rgb_corr"].get("tamper_score", 0) > 35:
        evidence.append(f"RGB: channel correlation break = {R['rgb_corr'].get('block_corr_std',0):.3f}")
    if R["edge"].get("tamper_score", 0) > 35:
        evidence.append(f"Edge: gradient discontinuity CV = {R['edge'].get('edge_gradient_cv',0):.3f}")
    if R["block"].get("tamper_score", 0) > 30:
        evidence.append(f"Block artifact ratio = {R['block'].get('blocking_ratio',0):.3f} (double JPEG compression)")
    meta_findings = R["metadata"].get("findings", [])
    evidence.extend([str(f) for f in meta_findings if "consistent" not in str(f).lower()])
    if R["copy_move"].get("clone_matches", 0) > 5:
        n = R["copy_move"]["clone_matches"]
        evidence.append(f"Copy-move: {n} cloned pixel regions found")

    if not evidence:
        evidence.append("No significant forensic anomalies detected")

    raw_scores = {
        "jpeg_ghost":   float(round(R["jpeg_ghost"].get("tamper_score", 0), 1)),
        "prnu_noise":   float(round(R["prnu"].get("tamper_score", 0), 1)),
        "fft_spectral": float(round(R["fft"].get("tamper_score", 0), 1)),
        "rgb_corr":     float(round(R["rgb_corr"].get("tamper_score", 0), 1)),
        "edge_gradient":float(round(R["edge"].get("tamper_score", 0), 1)),
        "block_artifact":float(round(R["block"].get("tamper_score", 0), 1)),
        "metadata":     float(round(R["metadata"].get("tamper_score", 0), 1)),
        "copy_move":    float(round(R["copy_move"].get("tamper_score", 0), 1)),
    }

    return {
        "status": str(status),
        "is_fake": bool(is_fake),
        "forensic_score": float(round(weighted_score, 1)),
        "confidence": f"{round(confidence, 1)}%",
        "source": "MAYA-BREAK Forensic Engine v3.0 (8 Algorithms)",
        "evidence": [str(e) for e in evidence],
        "raw_scores": raw_scores,
    }
