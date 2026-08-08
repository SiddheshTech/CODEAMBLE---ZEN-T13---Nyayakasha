import os
import random
from PIL import Image, ImageDraw, ImageFont

DATA_DIR = "doc_data"
TRAIN_REAL = os.path.join(DATA_DIR, "train", "real")
TRAIN_FAKE = os.path.join(DATA_DIR, "train", "fake")
VAL_REAL = os.path.join(DATA_DIR, "val", "real")
VAL_FAKE = os.path.join(DATA_DIR, "val", "fake")

for d in [TRAIN_REAL, TRAIN_FAKE, VAL_REAL, VAL_FAKE]:
    os.makedirs(d, exist_ok=True)

def generate_real_doc():
    # 800x1000 white background
    img = Image.new('RGB', (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Draw some standard text lines
    for i in range(50, 950, 40):
        length = random.randint(300, 700)
        draw.line((50, i, 50 + length, i), fill=(0, 0, 0), width=4)
        
    # Draw a signature block
    draw.rectangle([500, 800, 750, 900], outline=(0,0,0), width=2)
    return img

def generate_fake_doc():
    img = generate_real_doc()
    draw = ImageDraw.Draw(img)
    
    # Simulate a copy-paste forgery (e.g. changing an amount or signature)
    # Paste a slightly off-white rectangle with different text/lines
    paste_x = random.randint(100, 400)
    paste_y = random.randint(200, 600)
    
    # Slightly off-white background to simulate mismatched scan
    bg_color = (245, 248, 250) 
    draw.rectangle([paste_x, paste_y, paste_x + 200, paste_y + 80], fill=bg_color)
    draw.line((paste_x + 10, paste_y + 40, paste_x + 190, paste_y + 40), fill=(20, 20, 20), width=6)
    
    return img

print("Generating synthetic document dataset...")
for i in range(500):
    real_img = generate_real_doc()
    fake_img = generate_fake_doc()
    
    # Save as JPEG with random quality to simulate scans
    q_real = random.randint(85, 100)
    q_fake = random.randint(70, 90) # Fakes often have lower quality or re-compression
    
    if i < 400:
        real_img.save(os.path.join(TRAIN_REAL, f"real_{i}.jpg"), "JPEG", quality=q_real)
        fake_img.save(os.path.join(TRAIN_FAKE, f"fake_{i}.jpg"), "JPEG", quality=q_fake)
    else:
        real_img.save(os.path.join(VAL_REAL, f"real_{i}.jpg"), "JPEG", quality=q_real)
        fake_img.save(os.path.join(VAL_FAKE, f"fake_{i}.jpg"), "JPEG", quality=q_fake)

print("Done generating 1000 document images (500 real, 500 fake).")
