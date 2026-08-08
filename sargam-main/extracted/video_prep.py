"""
Video preprocessing: extract frames at a fixed interval so a 2D CNN
(image model) can be reused for video instead of needing a separate
3D-CNN. Cheaper to run and fine enough for a demo/hackathon timeline.
"""

import cv2
from PIL import Image
from typing import List


def extract_frames(video_path: str, every_n: int = 10, max_frames: int = 30) -> List[Image.Image]:
    """
    Pull every Nth frame from a video, up to max_frames, and return
    them as PIL Images (so they can go straight into image_prep.py).
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    frames = []
    frame_index = 0
    while cap.isOpened() and len(frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_index % every_n == 0:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(Image.fromarray(rgb_frame))
        frame_index += 1

    cap.release()
    return frames


def aggregate_frame_scores(scores: List[float], method: str = "mean") -> float:
    """
    Combine per-frame tamper/fake confidence scores into one video-level
    score. 'max' is more sensitive (any suspicious frame flags the whole
    video); 'mean' is smoother and less prone to one noisy frame causing
    a false positive.
    """
    if not scores:
        return 0.0
    if method == "max":
        return max(scores)
    return sum(scores) / len(scores)
