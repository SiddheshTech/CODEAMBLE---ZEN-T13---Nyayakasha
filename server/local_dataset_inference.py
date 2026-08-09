"""
MAYA-BREAK Forensic API v5.0
==============================
Advanced Hybrid engine combining:
  1. MAYA-BREAK Forensic Engine v3.0  (8 algorithmic detectors)
  2. Strict CNN + ELA + Noise Variance Engine (from files (1)/advanced_verify.py)

Both engines run on every upload. Results are merged into one verdict.
"""

import os
import io
import sys
import tempfile
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import cv2
import pymupdf as fitz  # PyMuPDF (replaces deprecated `import fitz`)

# ── Our algorithmic engine ─────────────────────────────────────────────────
from forensic_engine import analyze_image

# ── CNN pipeline (files(1)) ────────────────────────────────────────────────
FILES1_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "..", "files (1)")
FILES1_DIR = os.path.abspath(FILES1_DIR)
sys.path.insert(0, FILES1_DIR)

try:
    import torch
    from advanced_verify import load_model, advanced_verify_image
    
    DEVICE = "cpu"
    MODEL_PT = os.path.join(FILES1_DIR, "fake_detector.pt")
    DOC_MODEL_PT = os.path.join(FILES1_DIR, "doc_detector.pt")

    if os.path.exists(MODEL_PT):
        cnn_model, cnn_classes = load_model(MODEL_PT, device=DEVICE)
        CNN_READY = True
        CNN_AVAILABLE = True
        print(f"ResNet50 generic model loaded from {MODEL_PT}")
    else:
        CNN_READY = False
        CNN_AVAILABLE = False
        print("ResNet50 generic model weights not found — using only algorithmic engine")

    DOC_CNN_READY = False
    doc_cnn_model = None
    doc_cnn_classes = None
    
    if os.path.exists(DOC_MODEL_PT):
        doc_cnn_model, doc_cnn_classes = load_model(DOC_MODEL_PT, device=DEVICE)
        DOC_CNN_READY = True
        print(f"ResNet50 PDF/Doc model loaded from {DOC_MODEL_PT}")
    else:
        print("ResNet50 PDF/Doc model not found — falling back to generic model")

    def cnn_advanced_score(image_bytes: bytes, is_doc: bool = False) -> dict:
        """Run Advanced Verify logic and return full dict."""
        global DOC_CNN_READY, doc_cnn_model, doc_cnn_classes
        
        # Lazy load doc model if it finished training
        if is_doc and not DOC_CNN_READY and os.path.exists(DOC_MODEL_PT):
            doc_cnn_model, doc_cnn_classes = load_model(DOC_MODEL_PT, device=DEVICE)
            DOC_CNN_READY = True
            print("Dynamically loaded doc_detector.pt!")
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Use PDF-specific model if requested and available
        if is_doc and DOC_CNN_READY:
            return advanced_verify_image(doc_cnn_model, doc_cnn_classes, pil_image, DEVICE)
            
        # Fallback to generic model
        if not CNN_READY:
            return {"overall_risk_score": 0.0, "metrics": {"cnn_fake_probability": 0.0}}
        return advanced_verify_image(cnn_model, cnn_classes, pil_image, DEVICE)

except Exception as e:
    CNN_AVAILABLE = False
    CNN_READY = False
    DOC_CNN_READY = False
    print(f"CNN pipeline not available: {e}")

    def cnn_advanced_score(image_bytes: bytes, is_doc: bool = False) -> dict:
        return {"overall_risk_score": 0.0, "metrics": {"cnn_fake_probability": 0.0}}

# ── Try OCR (optional, graceful fallback) ────────────────────────────────
try:
    import pytesseract
    # On Windows, set the path if needed
    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False


def run_ocr_on_image(pil_image: Image.Image) -> dict:
    """Run OCR and return extracted fields if available."""
    if not OCR_AVAILABLE:
        return {"raw_text": "", "dates_found": [], "possible_ids": [], "word_count": 0}
    try:
        from doc_prep import extract_structured_fields
        return extract_structured_fields(pil_image)
    except Exception:
        return {"raw_text": "", "dates_found": [], "possible_ids": [], "word_count": 0}


def hybrid_verdict(algo_score: float, advanced_dict: dict) -> dict:
    """
    Combine the 8-algorithm score (0-100) and the new advanced verify score (0-100).
    """
    if CNN_READY:
        advanced_risk = advanced_dict.get("overall_risk_score", 0.0)
        # Weighted blend: 50% 8-Algo + 50% Advanced Verify (CNN+ELA+Noise)
        final = float(algo_score * 0.50 + advanced_risk * 0.50)
    else:
        final = float(algo_score)

    return {"final_score": round(final, 1)}


# ── Flask app ──────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

print("MAYA-BREAK Forensic API v5.0 starting...")
print(f"  Algorithmic engine: ACTIVE (8 algorithms)")
print(f"  Advanced CNN:      {'ACTIVE (Strict Engine)' if CNN_READY else 'NOT AVAILABLE'}")
print(f"  OCR (Tesseract):   {'ACTIVE' if OCR_AVAILABLE else 'NOT AVAILABLE (install Tesseract)'}")


@app.route('/', methods=['GET'])
def index():
    return {
        "name": "MAYA-BREAK Forensic API v5.0",
        "algorithmic_engine": "8-algorithm forensic suite",
        "cnn_engine": f"Advanced Strict Engine ({'trained' if CNN_READY else 'unavailable'})",
        "ocr": str(OCR_AVAILABLE),
    }


@app.route('/predict_json', methods=['POST'])
def predict_json():
    try:
        data = request.get_json(force=True) or {}
        data_url = data.get('image_base64', '') or data.get('dataUrl', '')
        evidence_type = (data.get('evidence_type') or data.get('type') or 'image').lower()

        if not data_url:
            return jsonify({"error": "No image_base64 or dataUrl provided"}), 400

        if ',' in data_url:
            base64_str = data_url.split(',')[1]
        else:
            base64_str = data_url

        import base64
        image_bytes = base64.b64decode(base64_str)

        algo_result = analyze_image(image_bytes, "Image")
        is_doc = evidence_type == "document"
        advanced_dict = cnn_advanced_score(image_bytes, is_doc=is_doc)

        verdict = hybrid_verdict(algo_result["forensic_score"], advanced_dict)
        final = verdict["final_score"]

        is_fake = bool(final >= 38)
        if final >= 70:
            status = "HIGH RISK: Strong Forgery Evidence"
        elif final >= 38:
            status = "MODERATE RISK: Tampering Detected"
        elif final >= 20:
            status = "LOW RISK: Minor Anomalies"
        else:
            status = "Authentic (Original)"
        confidence = float(final if is_fake else (100.0 - final))

        return jsonify({
            "status": str(status),
            "is_fake": bool(is_fake),
            "forensic_score": round(final, 1),
            "confidence": f"{round(confidence, 1)}%",
            "source": "Hybrid (8-Algo + Advanced Strict Engine)",
            "cnn_tamper_confidence": round(float(advanced_dict["metrics"]["cnn_fake_probability"]), 3),
            "evidence": [str(e) for e in algo_result.get("evidence", [])],
            "raw_scores": {k: float(v) for k, v in algo_result.get("raw_scores", {}).items()},
        })
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "trace": traceback.format_exc()[-500:]}), 500


@app.route('/analyze_local', methods=['POST'])
@app.route('/predict', methods=['POST'])
def analyze_evidence_locally():
    if 'file' not in request.files:
        return jsonify({"error": "No file in request"}), 400

    file = request.files['file']
    evidence_type = request.form.get("type", "image").lower()

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    ext = file.filename.lower().rsplit('.', 1)[-1] if '.' in file.filename else ''

    try:
        # ── VIDEO ─────────────────────────────────────────────────────────
        if evidence_type == "video" or ext in ['mp4', 'avi', 'mov', 'mkv']:
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
                file.save(tmp.name)
                tmp_path = tmp.name

            frames_analyzed = []
            cnn_scores = []

            cap = cv2.VideoCapture(tmp_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            sample_indices = [int(total_frames * i / 5) for i in range(5)]

            for idx in sample_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret:
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    pil_frame = Image.fromarray(frame_rgb)
                    buf = io.BytesIO()
                    pil_frame.save(buf, format='JPEG', quality=95)
                    fbytes = buf.getvalue()
                    frames_analyzed.append(analyze_image(fbytes, "Video Frame"))
                    cnn_scores.append(cnn_advanced_score(fbytes))

            cap.release()
            os.remove(tmp_path)

            if not frames_analyzed:
                return jsonify({"error": "Could not read video frames"}), 400

            avg_algo = float(np.mean([f["forensic_score"] for f in frames_analyzed]))
            
            # Extract raw cnn_fake_probability to display in UI
            avg_raw_cnn = float(np.mean([s["metrics"]["cnn_fake_probability"] for s in cnn_scores])) if cnn_scores else 0.0
            avg_adv_risk = {"overall_risk_score": float(np.mean([s["overall_risk_score"] for s in cnn_scores]))} if cnn_scores else {"overall_risk_score": 0.0}
            
            verdict = hybrid_verdict(avg_algo, avg_adv_risk)
            final = verdict["final_score"]

            is_fake = bool(final >= 38)
            status = "Deepfake / Tampered Video Detected" if is_fake else "Authentic Video"
            confidence = float(final if is_fake else (100.0 - final))

            return jsonify({
                "status": str(status),
                "is_fake": bool(is_fake),
                "forensic_score": round(final, 1),
                "confidence": f"{round(confidence, 1)}%",
                "source": "Hybrid (8-Algo + Advanced Strict Engine)",
                "frames_analyzed": int(len(frames_analyzed)),
                "cnn_tamper_confidence": round(avg_raw_cnn, 3),
                "evidence": [str(e) for e in frames_analyzed[0].get("evidence", [])],
                "raw_scores": {k: float(v) for k, v in frames_analyzed[0].get("raw_scores", {}).items()},
            })

        # ── DOCUMENT (PDF) ────────────────────────────────────────────────
        elif evidence_type == "document" or ext == "pdf":
            file_bytes = file.read()
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            if len(doc) == 0:
                return jsonify({"error": "Empty PDF"}), 400

            page_results = []
            cnn_scores = []
            all_ocr_fields = {"dates_found": [], "possible_ids": [], "word_count": 0, "raw_text": ""}

            all_evidence = []
            
            for page_num in range(min(3, len(doc))):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(dpi=150)
                img_bytes = pix.tobytes("jpeg")

                res = analyze_image(img_bytes, f"Page {page_num+1}")
                page_results.append(res)
                all_evidence.extend([str(e) for e in res.get("evidence", [])])
                cnn_scores.append(cnn_advanced_score(img_bytes, is_doc=True))

                # OCR each page
                pil_page = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                ocr = run_ocr_on_image(pil_page)
                all_ocr_fields["dates_found"].extend(ocr.get("dates_found", []))
                all_ocr_fields["possible_ids"].extend(ocr.get("possible_ids", []))
                all_ocr_fields["word_count"] += ocr.get("word_count", 0)
                all_ocr_fields["raw_text"] += ocr.get("raw_text", "") + "\n"

            # Check for keyword flags in filename or OCR text
            filename_lower = file.filename.lower()
            ocr_lower = all_ocr_fields["raw_text"].lower()
            blacklist_keywords = ["fictional", "demo", "sample", "specimen", "dummy", "fake", "mock", "placeholder"]
            
            is_blacklisted = False
            for word in blacklist_keywords:
                if word in filename_lower or word in ocr_lower:
                    is_blacklisted = True
                    all_evidence.append(f"Blacklist Keyword Detected: '{word}'")

            avg_algo = float(np.mean([p["forensic_score"] for p in page_results]))
            avg_raw_cnn = float(np.mean([s["metrics"]["cnn_fake_probability"] for s in cnn_scores])) if cnn_scores else 0.0
            avg_adv_risk = {"overall_risk_score": float(np.mean([s["overall_risk_score"] for s in cnn_scores]))} if cnn_scores else {"overall_risk_score": 0.0}
            
            verdict = hybrid_verdict(avg_algo, avg_adv_risk)
            final = verdict["final_score"]

            if is_blacklisted:
                final = max(final, 95.0)

            # Strict Perfect CNN Block: if ANY page looks fake to the CNN, reject the document
            max_raw_cnn = float(np.max([s["metrics"]["cnn_fake_probability"] for s in cnn_scores])) if cnn_scores else 0.0
            if max_raw_cnn > 0.5:
                final = 100.0
                all_evidence.append(f"CNN Strict Override (Confidence: {max_raw_cnn*100:.1f}%)")

            # Very strict threshold for PDFs (35 instead of 38)
            is_fake = bool(final >= 35)
            status = "Document Forgery Detected" if is_fake else "Authentic Document"
            confidence = float(final if is_fake else (100.0 - final))

            unique_evidence = list(dict.fromkeys(all_evidence))

            merged_scores = {}
            for r in page_results:
                for k, v in r.get("raw_scores", {}).items():
                    merged_scores[k] = merged_scores.get(k, 0.0) + float(v)
            merged_scores = {k: round(v / len(page_results), 1) for k, v in merged_scores.items()}

            return jsonify({
                "status": str(status),
                "is_fake": bool(is_fake),
                "forensic_score": round(final, 1),
                "confidence": f"{round(confidence, 1)}%",
                "source": "Hybrid (8-Algo + Advanced Strict Engine + OCR)",
                "pages_analyzed": int(len(page_results)),
                "cnn_tamper_confidence": round(avg_raw_cnn, 3),
                "ocr_fields": {
                    "dates_found": list(dict.fromkeys(all_ocr_fields["dates_found"]))[:5],
                    "possible_ids": list(dict.fromkeys(all_ocr_fields["possible_ids"]))[:5],
                    "word_count": int(all_ocr_fields["word_count"]),
                },
                "evidence": unique_evidence[:6],
                "raw_scores": merged_scores,
            })

        # ── IMAGE ─────────────────────────────────────────────────────────
        else:
            image_bytes = file.read()
            algo_result = analyze_image(image_bytes, "Image")
            # If the UI uploaded a document image directly (e.g. single page scan)
            is_doc = evidence_type == "document"
            advanced_dict = cnn_advanced_score(image_bytes, is_doc=is_doc)

            verdict = hybrid_verdict(algo_result["forensic_score"], advanced_dict)
            final = verdict["final_score"]

            is_fake = bool(final >= 38)
            if final >= 70:
                status = "HIGH RISK: Strong Forgery Evidence"
            elif final >= 38:
                status = "MODERATE RISK: Tampering Detected"
            elif final >= 20:
                status = "LOW RISK: Minor Anomalies"
            else:
                status = "Authentic (Original)"
            confidence = float(final if is_fake else (100.0 - final))

            # Also run OCR if it's a document image
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            ocr = run_ocr_on_image(pil_img)

            return jsonify({
                "status": str(status),
                "is_fake": bool(is_fake),
                "forensic_score": round(final, 1),
                "confidence": f"{round(confidence, 1)}%",
                "source": "Hybrid (8-Algo + Advanced Strict Engine)",
                "cnn_tamper_confidence": round(float(advanced_dict["metrics"]["cnn_fake_probability"]), 3),
                "ocr_fields": {
                    "dates_found": ocr.get("dates_found", [])[:5],
                    "possible_ids": ocr.get("possible_ids", [])[:5],
                    "word_count": int(ocr.get("word_count", 0)),
                },
                "evidence": [str(e) for e in algo_result.get("evidence", [])],
                "raw_scores": {k: float(v) for k, v in algo_result.get("raw_scores", {}).items()},
            })

    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "trace": traceback.format_exc()[-500:]}), 500


if __name__ == '__main__':
    print("Starting on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False)
