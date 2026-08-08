"""
Document preprocessing: OCR text/field extraction using pytesseract.
Requires the Tesseract binary to be installed on the host system
(e.g. `apt install tesseract-ocr` on Linux, or the Windows installer
from https://github.com/UB-Mannheim/tesseract/wiki).

This module handles image-based documents (scanned IDs, certificates,
receipts, etc). PDF text extraction is handled separately if the
document is a real PDF rather than a scanned image.
"""

import pytesseract
from PIL import Image
import re


def extract_text(pil_image: Image.Image) -> str:
    """Run OCR on a document image and return raw extracted text."""
    return pytesseract.image_to_string(pil_image)


def extract_structured_fields(pil_image: Image.Image) -> dict:
    """
    Very lightweight field extraction using regex over OCR output.
    Adjust the patterns to match the actual document types you're
    verifying (student ID, certificate, municipal form, etc).
    """
    text = extract_text(pil_image)

    fields = {
        "raw_text": text,
        "dates_found": re.findall(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b", text),
        "possible_ids": re.findall(r"\b[A-Z0-9]{6,}\b", text),
        "word_count": len(text.split()),
    }
    return fields


def looks_like_expected_document(pil_image: Image.Image, required_keywords: list) -> bool:
    """
    Simple validity check: does the OCR'd text contain the keywords you'd
    expect on a legitimate document of this type (e.g. institution name,
    "Certificate", "Government of Maharashtra", etc)?
    Use this as a cheap first-pass filter before running the CNN, so you
    don't waste inference time on obviously wrong document types.
    """
    text = extract_text(pil_image).lower()
    return any(keyword.lower() in text for keyword in required_keywords)
