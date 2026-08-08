"""
train_cnn.py
============
Trains a CNN to classify images (and rendered PDF pages) as REAL or FAKE.

This is a supervised classifier: it needs labeled examples of both
classes to learn from. It will NOT work well with zero or very few
examples -- that's the fundamental difference between this and the
heuristic-only verify_file.py script. The heuristics catch generic
"signs of editing"; this model learns to recognize the SPECIFIC kind
of fakes you show it, so accuracy depends heavily on how representative
your training data is of the fakes you actually expect to see.

--------------------------------------------------------------------
REQUIRED FOLDER STRUCTURE (create this before running):
--------------------------------------------------------------------
    data/
        train/
            real/    put 100+ genuine document/image examples here
            fake/    put 100+ known-fake/forged examples here
        val/
            real/    a smaller held-out set (never seen during training)
            fake/    same, held-out fakes

More examples = better accuracy. As a rough guide:
    50-100 per class   -> works for a demo, not production-reliable
    300-500 per class   -> reasonably reliable
    1000+ per class      -> production-grade

If you don't have real fake examples yet, generate synthetic ones:
copy-paste edited regions, recompress at various JPEG qualities, splice
in a screenshot into a photo, etc. Diversity matters more than volume --
a model trained only on one type of fake won't catch other types.

--------------------------------------------------------------------
USAGE:
--------------------------------------------------------------------
    pip install torch torchvision pillow scikit-learn

    python train_cnn.py --data_dir data --epochs 15 --out fake_detector.pt

--------------------------------------------------------------------
"""

import argparse
import os
import copy

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from sklearn.metrics import classification_report, confusion_matrix


IMAGE_SIZE = 224
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD = [0.229, 0.224, 0.225]


def build_transforms():
    """
    Training transform includes augmentation so the model generalizes
    instead of memorizing your specific training images. Validation
    transform is deterministic (no augmentation) so you get a true
    read on accuracy.
    """
    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(p=0.3),
        transforms.RandomRotation(degrees=5),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
    ])

    return train_transform, val_transform


def build_model(num_classes: int = 2, freeze_backbone: bool = False) -> nn.Module:
    """
    ResNet50 pretrained on ImageNet, fine-tuned for real-vs-fake.
    freeze_backbone=False (default) fine-tunes the whole network, which
    gives noticeably better accuracy than training only the last layer
    -- worth the extra training time if you have 300+ images per class.
    Set freeze_backbone=True for a quick, lower-accuracy run on small
    datasets or CPU-only machines.
    """
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False

    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.3),  # reduces overfitting on smaller datasets
        nn.Linear(in_features, num_classes),
    )

    return model


def compute_class_weights(dataset) -> torch.Tensor:
    """
    If you have unbalanced data (e.g. 300 real, 60 fake), the model
    will just learn to always predict 'real' and still score high
    accuracy while being useless. This weights the loss so mistakes
    on the minority class count more.
    """
    counts = [0] * len(dataset.classes)
    for _, label in dataset.samples:
        counts[label] += 1

    total = sum(counts)
    weights = [total / (len(counts) * c) if c > 0 else 0.0 for c in counts]
    return torch.tensor(weights, dtype=torch.float32)


def train(data_dir: str, epochs: int, batch_size: int, lr: float,
          out_path: str, freeze_backbone: bool, patience: int, device: str):

    train_transform, val_transform = build_transforms()

    train_ds = datasets.ImageFolder(os.path.join(data_dir, "train"), transform=train_transform)
    val_ds = datasets.ImageFolder(os.path.join(data_dir, "val"), transform=val_transform)

    if len(train_ds) == 0 or len(val_ds) == 0:
        raise RuntimeError(
            "No images found. Populate data/train/real, data/train/fake, "
            "data/val/real, data/val/fake with actual images before training."
        )

    print(f"Classes: {train_ds.classes}")  # e.g. ['fake', 'real'] -- alphabetical
    print(f"Train samples: {len(train_ds)} | Val samples: {len(val_ds)}")

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2)

    model = build_model(num_classes=len(train_ds.classes), freeze_backbone=freeze_backbone).to(device)

    class_weights = compute_class_weights(train_ds).to(device)
    print(f"Class weights (to handle imbalance): {dict(zip(train_ds.classes, class_weights.tolist()))}")
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    trainable_params = [p for p in model.parameters() if p.requires_grad]
    optimizer = optim.Adam(trainable_params, lr=lr)
    scheduler = ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    best_val_loss = float("inf")
    best_model_state = None
    epochs_without_improvement = 0

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
        val_loss, val_acc, report, cm = evaluate(model, val_loader, criterion, device, train_ds.classes)
        scheduler.step(val_loss)

        print(f"Epoch {epoch+1}/{epochs} - train_loss: {train_loss:.4f} "
              f"- val_loss: {val_loss:.4f} - val_acc: {val_acc:.4f}")

        # Early stopping: keep the best model seen so far, stop if we
        # haven't improved in `patience` epochs (avoids overfitting on
        # small datasets, and saves time).
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_model_state = copy.deepcopy(model.state_dict())
            epochs_without_improvement = 0
        else:
            epochs_without_improvement += 1
            if epochs_without_improvement >= patience:
                print(f"No improvement for {patience} epochs, stopping early.")
                break

    model.load_state_dict(best_model_state)
    final_val_loss, final_val_acc, final_report, final_cm = evaluate(
        model, val_loader, criterion, device, train_ds.classes
    )

    print("\n=== Final validation results (best checkpoint) ===")
    print(f"Val accuracy: {final_val_acc:.4f}")
    print("\nClassification report:")
    print(final_report)
    print("Confusion matrix (rows=true, cols=predicted):")
    print(f"  classes: {train_ds.classes}")
    print(final_cm)

    torch.save({
        "model_state_dict": best_model_state,
        "classes": train_ds.classes,
    }, out_path)
    print(f"\nSaved best model to {out_path}")


def evaluate(model, loader, criterion, device, class_names):
    model.eval()
    total_loss = 0.0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            total_loss += loss.item() * images.size(0)

            preds = outputs.argmax(dim=1)
            all_preds.extend(preds.cpu().tolist())
            all_labels.extend(labels.cpu().tolist())

    avg_loss = total_loss / len(loader.dataset)
    accuracy = sum(p == l for p, l in zip(all_preds, all_labels)) / len(all_labels)
    report = classification_report(all_labels, all_preds, target_names=class_names, zero_division=0)
    cm = confusion_matrix(all_labels, all_preds)

    return avg_loss, accuracy, report, cm


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train a real-vs-fake document/image CNN classifier")
    parser.add_argument("--data_dir", type=str, default="data")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--out", type=str, default="fake_detector.pt")
    parser.add_argument("--freeze_backbone", action="store_true",
                         help="Only train the final layer (faster, less accurate, good for CPU/small data)")
    parser.add_argument("--patience", type=int, default=4, help="Early stopping patience (epochs)")
    args = parser.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    if device == "cpu":
        print("No GPU detected -- training will be slow. Consider --freeze_backbone "
              "for a faster (lower-accuracy) run, or use Google Colab for a free GPU.")

    train(args.data_dir, args.epochs, args.batch_size, args.lr,
          args.out, args.freeze_backbone, args.patience, device)
