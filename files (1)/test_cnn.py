import os
import sys
import glob
from advanced_verify import verify_document

BASE_DIR = r"c:\Users\guptsag\OneDrive - ISS\Desktop\Nyayakasha\CODEAMBLE---ZEN-T13---Nyayakasha"
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_PATH = "fake_detector.pt"

real_images = glob.glob(os.path.join(DATASET_DIR, "archive (2)", "**", "REAL", "*.jpg"), recursive=True)[:20]
fake_images = glob.glob(os.path.join(DATASET_DIR, "archive (2)", "**", "FAKE", "*.jpg"), recursive=True)[:20]

print("=== TESTING REAL IMAGES (Should be AUTHENTIC) ===")
real_correct = 0
for img in real_images:
    res = verify_document(MODEL_PATH, img)
    if res["is_authentic"]:
        real_correct += 1
    print(f"{os.path.basename(img):15} -> {res['status']:16} (CNN Risk: {res['metrics']['cnn_fake_probability']*100:.1f}%)")
    
print("\n=== TESTING FAKE IMAGES (Should be FORGERY DETECTED) ===")
fake_correct = 0
for img in fake_images:
    res = verify_document(MODEL_PATH, img)
    if not res["is_authentic"]:
        fake_correct += 1
    print(f"{os.path.basename(img):15} -> {res['status']:16} (CNN Risk: {res['metrics']['cnn_fake_probability']*100:.1f}%)")

print(f"\nREAL ACCURACY: {real_correct}/20 ({(real_correct/20)*100:.1f}%)")
print(f"FAKE ACCURACY: {fake_correct}/20 ({(fake_correct/20)*100:.1f}%)")
