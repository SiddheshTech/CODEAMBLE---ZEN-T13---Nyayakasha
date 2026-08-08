"""
Model definition: fine-tuned ResNet18 as a binary classifier
(authentic=0 / tampered=1). Using a pretrained ImageNet backbone means
you don't need millions of training images -- a few hundred labeled
examples per class is enough to get a usable classifier for a demo.
"""

import torch
import torch.nn as nn
from torchvision import models


def build_model(num_classes: int = 2, freeze_backbone: bool = True) -> nn.Module:
    """
    Load a pretrained ResNet18 and replace the final layer for our
    binary (or multi-class) verification task.

    freeze_backbone=True trains only the new final layer, which is
    fast and works well with small datasets. Set to False for a full
    fine-tune once you have more data and more training time.
    """
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)

    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False

    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)  # this new layer always trains

    return model


def load_trained_model(weights_path: str, num_classes: int = 2, device: str = "cpu") -> nn.Module:
    """Load a model architecture and restore fine-tuned weights."""
    model = build_model(num_classes=num_classes, freeze_backbone=False)
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.eval()
    return model
