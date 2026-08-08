"""
predict.py
==========
Loads a CNN trained by train_cnn.py and uses it to verify images AND
PDFs. PDFs are handled by rendering each page to an image (via
PyMuPDF) and running the same trained classifier on each page, then
combining the per-page scores.

Usage:
    python predict.py fake_detector.pt path/to/file.jpg
    python predict.py fake_detector.pt path/to/file.pdf

Dependencies:
    pip install torch torchvision pillow pymupdf
"""

import sys
import os
import io
import json

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

try:
    import pymupdf as fitz
except ImportError:
    fitz = None


IMAGE_SIZE = 224
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD = [0.229, 0.224, 0.225]

inference_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
])


def build_model(num_classes: int) -> nn.Module:
    """Must match the architecture used in train_cnn.py exactly."""
    model = models.resnet50(weights=None)  # weights loaded from checkpoint, not ImageNet
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, num_classes),
    )
    return model


def load_model(checkpoint_path: str, device: str):
    checkpoint = torch.load(checkpoint_path, map_location=device)
    classes = checkpoint["classes"]  # e.g. ['fake', 'real'], alphabetical from ImageFolder

    model = build_model(num_classes=len(classes))
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    return model, classes


def predict_image(model, classes, pil_image: Image.Image, device: str) -> dict:
    tensor = inference_transform(pil_image.convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)[0]

    scores = {classes[i]: round(probs[i].item(), 4) for i in range(len(classes))}
    predicted_class = classes[probs.argmax().item()]

    return {"predicted_class": predicted_class, "scores": scores}


def predict_pdf(model, classes, pdf_path: str, device: str, dpi: int = 150) -> dict:
    if fitz is None:
        raise RuntimeError("PyMuPDF (pymupdf) is required for PDF inference. Install with: pip install pymupdf")

    doc = fitz.open(pdf_path)
    zoom = dpi / 72  # PDF default resolution is 72 dpi
    matrix = fitz.Matrix(zoom, zoom)

    page_results = []
    for page_index in range(len(doc)):
        page = doc[page_index]
        pixmap = page.get_pixmap(matrix=matrix)
        img_bytes = pixmap.tobytes("png")
        pil_image = Image.open(io.BytesIO(img_bytes))

        result = predict_image(model, classes, pil_image, device)
        result["page"] = page_index + 1
        page_results.append(result)

    doc.close()

    # Determine the "fake" class name flexibly, whatever label was used
    # in the training folder (defaults to looking for a class literally
    # named 'fake'; falls back to whichever class isn't the majority
    # prediction across pages if that label isn't found).
    fake_label = "fake" if "fake" in classes else classes[0]

    fake_scores = [r["scores"].get(fake_label, 0.0) for r in page_results]
    max_fake_score = max(fake_scores) if fake_scores else 0.0
    avg_fake_score = sum(fake_scores) / len(fake_scores) if fake_scores else 0.0

    # Flag the whole PDF as fake if ANY single page looks fake -- a
    # forged document often has only one altered page, and averaging
    # across many clean pages would dilute that signal.
    overall_verdict = fake_label if max_fake_score > 0.5 else [c for c in classes if c != fake_label][0]

    return {
        "file": os.path.basename(pdf_path),
        "page_count": len(page_results),
        "overall_verdict": overall_verdict,
        "max_fake_score": round(max_fake_score, 4),
        "avg_fake_score": round(avg_fake_score, 4),
        "per_page_results": page_results,
    }


def verify(checkpoint_path: str, file_path: str, device: str = None) -> dict:
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    model, classes = load_model(checkpoint_path, device)

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return predict_pdf(model, classes, file_path, device)
    elif ext in (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"):
        pil_image = Image.open(file_path)
        result = predict_image(model, classes, pil_image, device)
        result["file"] = os.path.basename(file_path)
        return result
    else:
        raise ValueError(f"Unsupported file type: {ext}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python predict.py <model_checkpoint.pt> <path_to_image_or_pdf>")
        sys.exit(1)

    checkpoint_path, file_path = sys.argv[1], sys.argv[2]

    if not os.path.exists(checkpoint_path):
        print(f"Model checkpoint not found: {checkpoint_path}. Run train_cnn.py first.")
        sys.exit(1)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    result = verify(checkpoint_path, file_path)
    print(json.dumps(result, indent=2))
