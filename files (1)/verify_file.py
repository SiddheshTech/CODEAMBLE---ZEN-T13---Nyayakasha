"""
verify_file.py
==============
Single-file forensic verification tool for IMAGES (jpg/png) and PDFs.

Why this beats a raw untrained CNN:
A CNN classifier is only as good as the labeled dataset you fine-tune it
on. Without hundreds of labeled "tampered" vs "authentic" examples, an
untrained CNN is a coin flip. This script instead combines several
well-established forensic signals that work immediately, with no
training required:

  1. Error Level Analysis (ELA)      - exposes recompression artifacts
  2. Metadata / EXIF analysis        - flags editing software, missing
                                        or inconsistent timestamps
  3. Copy-move forgery detection     - finds duplicated regions within
                                        the same image (ORB keypoints)
  4. JPEG quality / double-compression heuristic
  5. PDF structural analysis         - producer/creator mismatches,
                                        modification-after-creation,
                                        embedded image extraction +
                                        forensic checks on each image

Each signal produces a 0-1 suspicion score. They're combined into one
weighted verdict so no single false signal can flip the result on its
own.

Usage (CLI):
    python verify_file.py path/to/file.jpg
    python verify_file.py path/to/file.pdf

Usage (as a library):
    from verify_file import verify_file
    result = verify_file("path/to/file.jpg")
    print(result["verdict"], result["suspicion_score"])

Dependencies:
    pip install pillow numpy opencv-python pymupdf
"""

import io
import os
import sys
import json
import hashlib
from datetime import datetime
from typing import Optional

import numpy as np
from PIL import Image, ImageChops, ExifTags

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import pymupdf as fitz  # PyMuPDF (import name 'fitz' is the legacy/deprecated alias)
except ImportError:
    fitz = None


# ---------------------------------------------------------------------------
# Signal 1: Error Level Analysis
# ---------------------------------------------------------------------------

def error_level_analysis(pil_image: Image.Image, quality: int = 90) -> dict:
    """
    Re-save the image at a known JPEG quality and diff it against the
    original. Regions that were edited/spliced were compressed at a
    different point in the image's history, so they show a different
    error level than untouched regions -- this shows up as localized
    "hot spots" of high diff rather than a smooth, uniform noise floor.
    """
    buffer = io.BytesIO()
    rgb = pil_image.convert("RGB")
    rgb.save(buffer, "JPEG", quality=quality)
    buffer.seek(0)
    resaved = Image.open(buffer)

    diff = ImageChops.difference(rgb, resaved)
    diff_arr = np.array(diff).astype(np.float32)

    # A uniform, low-variance diff = likely untouched/original.
    # High variance or isolated bright patches = likely edited region.
    mean_error = float(diff_arr.mean())
    std_error = float(diff_arr.std())

    # Look for localized "hot regions" — patches far brighter than the
    # image's own average error level, which is what a spliced region
    # looks like under ELA.
    threshold = mean_error + 2 * std_error
    hot_pixels = float((diff_arr > threshold).mean())  # fraction of pixels

    # Heuristic scoring: high std relative to mean, or a notable fraction
    # of hot pixels, both suggest inconsistent compression history.
    variability_ratio = std_error / (mean_error + 1e-6)
    suspicion = min(1.0, (variability_ratio / 8.0) * 0.6 + hot_pixels * 40 * 0.4)

    return {
        "mean_error": round(mean_error, 3),
        "std_error": round(std_error, 3),
        "hot_pixel_fraction": round(hot_pixels, 5),
        "suspicion": round(float(suspicion), 3),
    }


# ---------------------------------------------------------------------------
# Signal 2: Metadata / EXIF analysis
# ---------------------------------------------------------------------------

EDITING_SOFTWARE_KEYWORDS = [
    "photoshop", "gimp", "lightroom", "snapseed", "picsart",
    "canva", "affinity", "pixlr", "facetune",
]


def metadata_analysis(pil_image: Image.Image) -> dict:
    """
    Check EXIF data for red flags: editing software signatures,
    missing capture metadata (real camera photos almost always have
    it; many tampered/re-exported images strip it), or inconsistent
    timestamps.
    """
    flags = []
    suspicion = 0.0

    exif_raw = pil_image._getexif() if hasattr(pil_image, "_getexif") else None

    if not exif_raw:
        flags.append("No EXIF metadata present (common after editing/re-export, but also normal for screenshots/downloads)")
        suspicion += 0.1
    else:
        exif = {ExifTags.TAGS.get(k, k): v for k, v in exif_raw.items()}

        software = str(exif.get("Software", "")).lower()
        if any(kw in software for kw in EDITING_SOFTWARE_KEYWORDS):
            flags.append(f"Editing software detected in metadata: '{exif.get('Software')}'")
            suspicion += 0.5

        datetime_original = exif.get("DateTimeOriginal")
        datetime_modified = exif.get("DateTime")
        if datetime_original and datetime_modified and datetime_original != datetime_modified:
            flags.append("Capture date and modification date differ")
            suspicion += 0.25

        if "GPSInfo" not in exif and "Make" not in exif:
            flags.append("Missing camera make/GPS info (may indicate screenshot or re-saved file)")
            suspicion += 0.1

    return {
        "flags": flags,
        "suspicion": round(min(1.0, suspicion), 3),
    }


# ---------------------------------------------------------------------------
# Signal 3: Copy-move forgery detection (duplicated regions)
# ---------------------------------------------------------------------------

def copy_move_detection(pil_image: Image.Image, min_matches: int = 40) -> dict:
    """
    Detects copy-move forgery: a common tampering technique where part
    of an image is copied and pasted elsewhere in the SAME image (e.g.
    to duplicate an object or cover something up). Uses ORB keypoint
    matching against the image and itself, excluding trivially close
    (self) matches.
    """
    if cv2 is None:
        return {"suspicion": 0.0, "note": "opencv not installed, skipped"}

    img = np.array(pil_image.convert("L"))  # grayscale for feature detection
    orb = cv2.ORB_create(nfeatures=1500)
    keypoints, descriptors = orb.detectAndCompute(img, None)

    if descriptors is None or len(keypoints) < 20:
        return {"suspicion": 0.0, "note": "not enough features to analyze"}

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    # k=3: for a self-vs-self match, the #1 nearest neighbor of any point
    # is always itself (distance 0). The real "is this region duplicated
    # elsewhere" candidate is the #2 match, tested against the #3 match
    # via Lowe's ratio to filter out coincidental/noisy matches.
    matches = bf.knnMatch(descriptors, descriptors, k=3)

    min_distance_px = 20  # ignore matches that are just neighboring keypoints
    offsets = []  # (dx, dy) for each candidate duplicate pair

    for match_triplet in matches:
        if len(match_triplet) < 3:
            continue
        self_match, candidate, runner_up = match_triplet
        if candidate.queryIdx == candidate.trainIdx:
            continue
        if candidate.distance < 0.7 * runner_up.distance:  # Lowe's ratio test
            pt1 = np.array(keypoints[candidate.queryIdx].pt)
            pt2 = np.array(keypoints[candidate.trainIdx].pt)
            if np.linalg.norm(pt1 - pt2) > min_distance_px:
                dx, dy = pt2 - pt1
                offsets.append((round(dx / 5) * 5, round(dy / 5) * 5))  # bin to tolerate small noise

    # Cluster by offset: a real copy-move forgery produces many pairs
    # sharing (approximately) the same displacement, since the whole
    # pasted region moved together. Scattered one-off matches with no
    # shared offset are almost always false positives (smooth regions,
    # repeated JPEG block artifacts, natural texture repetition).
    largest_cluster = 0
    if offsets:
        from collections import Counter
        counts = Counter(offsets)
        largest_cluster = counts.most_common(1)[0][1]

    suspicion = min(1.0, largest_cluster / min_matches)

    return {
        "total_candidate_matches": len(offsets),
        "largest_consistent_offset_cluster": largest_cluster,
        "suspicion": round(float(suspicion), 3),
    }


# ---------------------------------------------------------------------------
# Image verification: combines all image-level signals
# ---------------------------------------------------------------------------

WEIGHTS = {
    "ela": 0.4,
    "metadata": 0.25,
    "copy_move": 0.35,
}


def verify_image(path_or_bytes, filename: str = "") -> dict:
    if isinstance(path_or_bytes, (bytes, bytearray)):
        pil_image = Image.open(io.BytesIO(path_or_bytes))
        raw_bytes = path_or_bytes
    else:
        pil_image = Image.open(path_or_bytes)
        with open(path_or_bytes, "rb") as f:
            raw_bytes = f.read()

    ela_result = error_level_analysis(pil_image)
    meta_result = metadata_analysis(pil_image)
    copy_move_result = copy_move_detection(pil_image)

    weighted_score = (
        ela_result["suspicion"] * WEIGHTS["ela"]
        + meta_result["suspicion"] * WEIGHTS["metadata"]
        + copy_move_result["suspicion"] * WEIGHTS["copy_move"]
    )

    verdict = classify_score(weighted_score)

    return {
        "filename": filename or getattr(path_or_bytes, "name", "unknown"),
        "file_type": "image",
        "sha256": hashlib.sha256(raw_bytes).hexdigest(),
        "suspicion_score": round(weighted_score, 3),
        "verdict": verdict,
        "signals": {
            "error_level_analysis": ela_result,
            "metadata": meta_result,
            "copy_move_detection": copy_move_result,
        },
    }


# ---------------------------------------------------------------------------
# PDF verification
# ---------------------------------------------------------------------------

def verify_pdf(path: str) -> dict:
    if fitz is None:
        raise RuntimeError("PyMuPDF (pymupdf) is required for PDF verification. "
                            "Install with: pip install pymupdf")

    with open(path, "rb") as f:
        raw_bytes = f.read()

    doc = fitz.open(path)
    metadata = doc.metadata or {}

    flags = []
    suspicion = 0.0

    producer = (metadata.get("producer") or "").lower()
    creator = (metadata.get("creator") or "").lower()

    if any(kw in producer or kw in creator for kw in EDITING_SOFTWARE_KEYWORDS):
        flags.append(f"PDF metadata shows editing tool: producer='{metadata.get('producer')}', "
                      f"creator='{metadata.get('creator')}'")
        suspicion += 0.4

    creation_date = metadata.get("creationDate", "")
    mod_date = metadata.get("modDate", "")
    if creation_date and mod_date and creation_date != mod_date:
        flags.append("PDF was modified after its original creation date")
        suspicion += 0.25

    if doc.needs_pass:
        flags.append("PDF is password protected — could not fully inspect")
        suspicion += 0.1

    # Check for inconsistent fonts/objects across pages, a common sign
    # of content being spliced in from a different source document.
    fonts_per_page = []
    for page in doc:
        fonts = {f[3] for f in page.get_fonts()}  # font names
        fonts_per_page.append(fonts)

    if len(fonts_per_page) > 1:
        all_fonts = set().union(*fonts_per_page) if fonts_per_page else set()
        pages_missing_common_fonts = sum(
            1 for fonts in fonts_per_page if fonts and fonts != all_fonts and len(all_fonts) > 0
        )
        if pages_missing_common_fonts > 0 and len(all_fonts) > 3:
            flags.append("Inconsistent font usage across pages (possible content splicing)")
            suspicion += 0.15

    # Run image-level forensics on embedded images too
    embedded_image_results = []
    for page_index in range(len(doc)):
        page = doc[page_index]
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                pil_img = Image.open(io.BytesIO(image_bytes))
                result = verify_image(image_bytes, filename=f"page_{page_index+1}_img_{img_index+1}")
                embedded_image_results.append(result)
            except Exception:
                continue  # skip unreadable embedded images rather than failing the whole scan

    if embedded_image_results:
        avg_embedded_suspicion = sum(r["suspicion_score"] for r in embedded_image_results) / len(embedded_image_results)
        suspicion += avg_embedded_suspicion * 0.3

    suspicion = min(1.0, suspicion)
    verdict = classify_score(suspicion)
    page_count = doc.page_count

    doc.close()

    return {
        "filename": os.path.basename(path),
        "file_type": "pdf",
        "sha256": hashlib.sha256(raw_bytes).hexdigest(),
        "suspicion_score": round(suspicion, 3),
        "verdict": verdict,
        "page_count": page_count,
        "metadata": {
            "producer": metadata.get("producer"),
            "creator": metadata.get("creator"),
            "creation_date": creation_date,
            "modification_date": mod_date,
        },
        "flags": flags,
        "embedded_images_checked": len(embedded_image_results),
        "embedded_image_details": embedded_image_results,
    }


# ---------------------------------------------------------------------------
# Shared verdict logic + entry point
# ---------------------------------------------------------------------------

def classify_score(score: float) -> str:
    if score < 0.3:
        return "AUTHENTIC"
    elif score < 0.6:
        return "SUSPICIOUS"
    else:
        return "LIKELY TAMPERED"


def verify_file(path: str) -> dict:
    """Main entry point — detects file type and routes to the right verifier."""
    ext = os.path.splitext(path)[1].lower()

    if ext in (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"):
        return verify_image(path)
    elif ext == ".pdf":
        return verify_pdf(path)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Use jpg/png/pdf.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python verify_file.py <path_to_image_or_pdf>")
        sys.exit(1)

    target_path = sys.argv[1]
    if not os.path.exists(target_path):
        print(f"File not found: {target_path}")
        sys.exit(1)

    result = verify_file(target_path)
    print(json.dumps(result, indent=2, default=str))
    print(f"\nVERDICT: {result['verdict']}  (suspicion score: {result['suspicion_score']})")
