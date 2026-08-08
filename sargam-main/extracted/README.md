# Document / Image / Video Verification Service

A CNN-based pipeline that checks images, videos, and scanned documents for
tampering (using Error Level Analysis + a fine-tuned ResNet18 classifier),
plus basic document field extraction via OCR.

## How it works

1. **Images**: run through Error Level Analysis (`preprocessing/image_prep.py`),
   then classified by a fine-tuned ResNet18 as authentic vs. tampered.
2. **Videos**: frames are sampled every N frames (`preprocessing/video_prep.py`),
   each frame is scored the same way as an image, and scores are aggregated
   into one video-level confidence.
3. **Documents**: OCR (`preprocessing/doc_prep.py`, via pytesseract) extracts
   text/fields for validity checks, and the same tamper-detection CNN runs
   on the scanned image itself.

## Setup

```bash
pip install -r requirements.txt

# Tesseract binary is required separately for OCR:
# Ubuntu/Debian: sudo apt install tesseract-ocr
# Windows: https://github.com/UB-Mannheim/tesseract/wiki
# Mac: brew install tesseract
```

## Training the model

You need a labeled dataset first:

```
data/
    train/
        authentic/   *.jpg
        tampered/    *.jpg
    val/
        authentic/   *.jpg
        tampered/    *.jpg
```

Public datasets to start from: **CASIA v2** (image splicing/forgery),
**FaceForensics++** (video deepfakes, sample frames from it),
**MIDV-2020** (ID document forgery).

Run training:

```bash
cd model
python train.py --data_dir ../data --epochs 10 --out forgery_model.pt
```

Move the resulting `forgery_model.pt` into `model/` — the API looks for it
at `model/forgery_model.pt` by default (override with the `MODEL_PATH`
environment variable).

## Running the API

```bash
cd api
uvicorn main:app --reload --port 8000
```

Without a trained model file present, the API still runs (useful for
testing the pipeline end-to-end) but predictions are meaningless — it'll
tell you `model_ready: false` in every response.

### Endpoints

- `POST /verify/image` — form field `file`, an image
- `POST /verify/video` — form field `file`, a video
- `POST /verify/document` — form field `file` (scanned doc image), optional
  query param `required_keywords` (comma-separated) to validate expected text

## Frontend

`frontend/UploadForm.jsx` is a drop-in React component (Tailwind classes)
that hits the three endpoints above. Point `API_BASE` at your deployed API
URL when you're not running locally.

## Notes for a hackathon timeline

- Fine-tuning only the final layer (`freeze_backbone=True` in
  `model/model_def.py`) trains fast even on CPU with a few hundred images
  per class — good enough for a live demo.
- If you don't have time to collect/label a dataset, you can ship the OCR +
  keyword-validity check alone (skip the CNN tamper score) as a fallback —
  it still gives judges a working "verification" demo.
