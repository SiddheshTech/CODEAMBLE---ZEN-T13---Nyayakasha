"""
Image preprocessing utilities for the verification CNN.

Includes:
- Standard resize/normalize pipeline for CNN input
- Error Level Analysis (ELA): re-compresses the image at a known JPEG
  quality and diffs it against the original. Edited/spliced regions
  compress differently than untouched regions, so the diff exposes
  tampering that's invisible to the naked eye. This ELA image (not the
  raw photo) is what actually gets fed into the CNN for forgery models.
"""

import io
from PIL import Image, ImageChops, ImageEnhance
from torchvision import transforms

IMAGE_SIZE = 224

# Standard normalization stats CNNs pretrained on ImageNet expect
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD = [0.229, 0.224, 0.225]

base_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
])


def load_image(path_or_bytes):
    """Load an image from a filepath or raw bytes, return a PIL Image (RGB)."""
    if isinstance(path_or_bytes, (bytes, bytearray)):
        return Image.open(io.BytesIO(path_or_bytes)).convert("RGB")
    return Image.open(path_or_bytes).convert("RGB")


def error_level_analysis(pil_image: Image.Image, quality: int = 90, scale: int = 15) -> Image.Image:
    """
    Compute the ELA image for a PIL Image.

    Steps:
    1. Re-save the image at a fixed JPEG quality.
    2. Diff the re-saved version against the original pixel-by-pixel.
    3. Amplify the diff so tampered regions (which show a different
       error level than the rest of the image) become visible.
    """
    buffer = io.BytesIO()
    pil_image.save(buffer, "JPEG", quality=quality)
    buffer.seek(0)
    resaved = Image.open(buffer)

    diff = ImageChops.difference(pil_image, resaved)

    # Amplify the (usually very subtle) difference so the CNN has a
    # stronger signal to learn from.
    extrema = diff.getextrema()
    max_diff = max(e[1] for e in extrema) or 1
    factor = scale * 255.0 / max_diff
    diff = ImageEnhance.Brightness(diff).enhance(factor / 10)

    return diff


def preprocess_for_model(path_or_bytes, use_ela: bool = True):
    """
    Full pipeline: load -> (optional ELA) -> resize/normalize -> tensor.
    Returns a tensor of shape (1, 3, 224, 224) ready for the CNN.
    """
    img = load_image(path_or_bytes)
    if use_ela:
        img = error_level_analysis(img)
    tensor = base_transform(img)
    return tensor.unsqueeze(0)  # add batch dimension
