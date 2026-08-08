"""
FastAPI backend for the document/image/video verification service.

Run with:
    uvicorn main:app --reload --port 8000

Endpoints:
    POST /verify/image     - single image (jpg/png), returns tamper score
    POST /verify/video     - video file, samples frames and aggregates
    POST /verify/document  - scanned document image, OCR + optional CNN check
"""

import os
import sys
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.image_prep import preprocess_for_model
from preprocessing.video_prep import extract_frames, aggregate_frame_scores
from preprocessing.doc_prep import extract_structured_fields
from model.model_def import load_trained_model, build_model

app = FastAPI(title="Document/Image/Video Verification API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict this to your actual frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = os.environ.get("MODEL_PATH", "model/forgery_model.pt")

# Load the trained model once at startup if weights exist.
# Falls back to an untrained backbone so the API still runs for testing
# the pipeline before you've actually trained anything.
if os.path.exists(MODEL_PATH):
    model = load_trained_model(MODEL_PATH, device=DEVICE)
    MODEL_READY = True
else:
    model = build_model(freeze_backbone=False).to(DEVICE)
    model.eval()
    MODEL_READY = False

TAMPERED_CLASS_INDEX = 1  # matches ImageFolder alphabetical order: authentic=0, tampered=1


def run_inference(tensor) -> float:
    """Returns the model's confidence (0-1) that the input is tampered."""
    with torch.no_grad():
        tensor = tensor.to(DEVICE)
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        return probs[0][TAMPERED_CLASS_INDEX].item()


@app.get("/health")
def health():
    return {"status": "ok", "model_ready": MODEL_READY, "device": DEVICE}


@app.post("/verify/image")
async def verify_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    contents = await file.read()
    tensor = preprocess_for_model(contents, use_ela=True)
    confidence = run_inference(tensor)

    return {
        "filename": file.filename,
        "tampered_confidence": round(confidence, 4),
        "verified": confidence < 0.5,
        "model_ready": MODEL_READY,
    }


@app.post("/verify/video")
async def verify_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(400, "File must be a video")

    # write to a temp file since cv2.VideoCapture needs a real filepath
    suffix = os.path.splitext(file.filename)[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        frames = extract_frames(tmp_path, every_n=10, max_frames=30)
        if not frames:
            raise HTTPException(400, "Could not extract frames from video")

        from preprocessing.image_prep import error_level_analysis, base_transform

        scores = []
        for frame in frames:
            ela_frame = error_level_analysis(frame)
            tensor = base_transform(ela_frame).unsqueeze(0)
            scores.append(run_inference(tensor))

        video_score = aggregate_frame_scores(scores, method="mean")

        return {
            "filename": file.filename,
            "frames_analyzed": len(frames),
            "tampered_confidence": round(video_score, 4),
            "per_frame_scores": [round(s, 4) for s in scores],
            "verified": video_score < 0.5,
            "model_ready": MODEL_READY,
        }
    finally:
        os.unlink(tmp_path)


@app.post("/verify/document")
async def verify_document(file: UploadFile = File(...), required_keywords: str = ""):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Upload a scanned image of the document (jpg/png)")

    contents = await file.read()
    from PIL import Image
    import io
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")

    fields = extract_structured_fields(pil_image)

    keyword_check = None
    if required_keywords:
        keywords = [k.strip() for k in required_keywords.split(",") if k.strip()]
        text_lower = fields["raw_text"].lower()
        keyword_check = all(k.lower() in text_lower for k in keywords)

    tensor = preprocess_for_model(contents, use_ela=True)
    tamper_confidence = run_inference(tensor)

    return {
        "filename": file.filename,
        "extracted_fields": fields,
        "keyword_check_passed": keyword_check,
        "tampered_confidence": round(tamper_confidence, 4),
        "verified": tamper_confidence < 0.5 and (keyword_check is not False),
        "model_ready": MODEL_READY,
    }
