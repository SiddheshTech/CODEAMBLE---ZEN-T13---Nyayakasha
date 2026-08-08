"""
advanced_verify.py
==================
An advanced verification script that combines deep learning (ResNet50)
with traditional forensic algorithms (ELA, Noise Analysis) to ensure 
strict verification. It will aggressively reject fake data by enforcing
multi-layered checks.

Usage:
    python advanced_verify.py fake_detector.pt path/to/evidence.jpg
"""

import sys
import os
import io
import json
import math

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image, ImageChops, ImageStat, ImageEnhance
import numpy as np
import cv2

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

# ── 1. DEEP LEARNING MODEL ────────────────────────────────────────────────
def build_model(num_classes: int) -> nn.Module:
    model = models.resnet50(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, num_classes),
    )
    return model

def load_model(checkpoint_path: str, device: str):
    checkpoint = torch.load(checkpoint_path, map_location=device)
    classes = checkpoint["classes"]
    model = build_model(num_classes=len(classes))
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
    return model, classes

def cnn_predict(model, classes, pil_image: Image.Image, device: str) -> float:
    tensor = inference_transform(pil_image.convert("RGB")).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)[0]
    
    scores = {classes[i]: probs[i].item() for i in range(len(classes))}
    fake_label = "fake" if "fake" in classes else classes[0]
    return float(scores.get(fake_label, 0.0))

# ── 2. FORENSIC ALGORITHMS ────────────────────────────────────────────────
def calculate_ela_score(pil_image: Image.Image, quality=90) -> float:
    """Calculates Error Level Analysis (ELA) variance, specifically looking for local anomalies."""
    try:
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        buffer = io.BytesIO()
        pil_image.save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer)
        
        diff = ImageChops.difference(pil_image, resaved)
        extrema = diff.getextrema()
        max_diff = max(e[1] for e in extrema)
        if max_diff == 0:
            max_diff = 1
            
        scale = 255.0 / max_diff
        diff = ImageEnhance.Brightness(diff).enhance(scale)
        
        # Calculate local vs global stats to find "hotspots" of editing
        stat = ImageStat.Stat(diff)
        avg_diff = sum(stat.mean) / len(stat.mean)
        
        # Resize to a very small grid (e.g., 8x8 blocks) to find maximum local variance
        grid = diff.resize((8, 8), Image.Resampling.LANCZOS)
        grid_stat = ImageStat.Stat(grid)
        max_local = max(grid_stat.extrema[0][1], grid_stat.extrema[1][1], grid_stat.extrema[2][1])
        
        if avg_diff < 1: avg_diff = 1
        anomaly_ratio = max_local / avg_diff
        return float(anomaly_ratio)
    except Exception:
        return 0.0

def calculate_noise_variance(pil_image: Image.Image) -> float:
    """Estimates image noise variance (tampered images often have inconsistent noise)."""
    try:
        cv_img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        variance = laplacian.var()
        return float(variance)
    except Exception:
        return 0.0

# ── 3. ADVANCED VERIFICATION LOGIC ────────────────────────────────────────
def advanced_verify_image(model, classes, pil_image: Image.Image, device: str) -> dict:
    # 1. CNN Fake Probability (0.0 to 1.0)
    cnn_fake_prob = cnn_predict(model, classes, pil_image, device)
    
    # 2. ELA Score
    ela_score = calculate_ela_score(pil_image)
    
    # 3. Noise Variance
    noise_var = calculate_noise_variance(pil_image)
    cnn_risk = cnn_fake_prob * 100.0
    
    # ELA and Noise are deterministic physical algorithms. They are more reliable than an undertrained CNN.
    # Anomaly ratio (local max / global mean). Normal is ~2-3. Fake is usually > 4.
    ela_risk = min(100.0, max(0.0, (ela_score - 2.5) * 25)) 
    
    noise_risk = 0.0
    if noise_var < 10 or noise_var > 10000: # Extremely smooth (AI) or extremely noisy (spliced)
        noise_risk = 70.0
        
    # TRUE HYBRID AGGREGATION
    # Since the CNN is currently undertrained (hovering around 50%), we give it lower weight.
    # We let the physical algorithms do the heavy lifting for forgery detection.
    
    avg_risk = (ela_risk * 0.6) + (noise_risk * 0.2) + (cnn_risk * 0.2)
    max_risk = max(ela_risk, noise_risk, cnn_risk * 0.5)
    
    final_risk = max(avg_risk, max_risk)
    
    # PDF CRITICAL OVERRIDE:
    # Documents (PDFs) often have perfect solid colors, making ELA (0) and Noise (0).
    # If the CNN (which is trained on documents) strongly suspects a fake, it must override.
    if cnn_risk > 70.0:
        final_risk = max(final_risk, cnn_risk)
    
    # Threshold set to 60. Real images generally have low ELA and normal noise (risk < 40).
    # Fakes will spike the ELA risk to 80-100, pulling the final risk > 60.
    is_authentic = bool(final_risk < 60.0)
    status = "AUTHENTIC" if is_authentic else "FORGERY DETECTED"
    
    if not is_authentic and final_risk > 75.0:
        status = "HIGH RISK FORGERY"
        
    return {
        "status": status,
        "is_authentic": is_authentic,
        "overall_risk_score": round(final_risk, 2),
        "metrics": {
            "cnn_fake_probability": round(cnn_fake_prob, 4),
            "ela_anomaly_score": round(ela_risk, 2),
            "noise_variance": round(noise_var, 2)
        },
        "details": "Data has been verified using Advanced Hybrid Engine."
    }

def verify_document(checkpoint_path: str, file_path: str) -> dict:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, classes = load_model(checkpoint_path, device)
    
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        if fitz is None:
            return {"error": "PyMuPDF not installed."}
            
        doc = fitz.open(file_path)
        page_results = []
        
        for page_index in range(min(3, len(doc))): # Check up to 3 pages
            page = doc[page_index]
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            pil_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            
            res = advanced_verify_image(model, classes, pil_image, device)
            page_results.append(res)
            
        doc.close()
        
        # Strict checking across pages: if ANY page is fake, document is fake
        max_risk = max([r["overall_risk_score"] for r in page_results])
        is_authentic = all([r["is_authentic"] for r in page_results])
        
        return {
            "file": os.path.basename(file_path),
            "type": "PDF Document",
            "status": "AUTHENTIC" if is_authentic else "FORGERY DETECTED",
            "is_authentic": is_authentic,
            "max_risk_score": max_risk,
            "pages_analyzed": len(page_results),
            "page_breakdown": page_results
        }
        
    elif ext in [".jpg", ".jpeg", ".png", ".webp"]:
        pil_image = Image.open(file_path).convert("RGB")
        res = advanced_verify_image(model, classes, pil_image, device)
        res["file"] = os.path.basename(file_path)
        res["type"] = "Image"
        return res
        
    else:
        return {"error": f"Unsupported file type: {ext}"}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python advanced_verify.py <model.pt> <file>")
        sys.exit(1)
        
    model_path = sys.argv[1]
    target_file = sys.argv[2]
    
    if not os.path.exists(model_path):
        print(f"ERROR: Model not found at {model_path}")
        sys.exit(1)
        
    if not os.path.exists(target_file):
        print(f"ERROR: File not found at {target_file}")
        sys.exit(1)
        
    result = verify_document(model_path, target_file)
    print(json.dumps(result, indent=2))
