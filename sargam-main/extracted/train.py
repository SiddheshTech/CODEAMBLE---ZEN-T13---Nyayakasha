"""
Fine-tuning script.

Expected folder layout (standard torchvision ImageFolder format):

    data/
        train/
            authentic/   *.jpg
            tampered/    *.jpg
        val/
            authentic/   *.jpg
            tampered/    *.jpg

For forgery detection, run your images through image_prep.error_level_analysis
BEFORE saving them into this folder structure, so the model trains on
ELA images rather than raw photos -- that's where the tamper signal lives.

Usage:
    python train.py --data_dir data --epochs 10 --out forgery_model.pt
"""

import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.image_prep import base_transform
from model.model_def import build_model


def train(data_dir: str, epochs: int, batch_size: int, lr: float, out_path: str, device: str):
    train_ds = datasets.ImageFolder(os.path.join(data_dir, "train"), transform=base_transform)
    val_ds = datasets.ImageFolder(os.path.join(data_dir, "val"), transform=base_transform)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    print(f"Classes: {train_ds.classes}")  # e.g. ['authentic', 'tampered']

    model = build_model(num_classes=len(train_ds.classes), freeze_backbone=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=lr)

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)

        train_loss = running_loss / len(train_ds)
        val_acc = evaluate(model, val_loader, device)
        print(f"Epoch {epoch+1}/{epochs} - train_loss: {train_loss:.4f} - val_acc: {val_acc:.4f}")

    torch.save(model.state_dict(), out_path)
    print(f"Saved model weights to {out_path}")


def evaluate(model, loader, device):
    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    return correct / total if total else 0.0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="data")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--out", type=str, default="forgery_model.pt")
    args = parser.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    train(args.data_dir, args.epochs, args.batch_size, args.lr, args.out, device)
