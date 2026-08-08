import os
import json
import glob
import zipfile
import shutil
from datetime import datetime
import numpy as np
import tensorflow as tf
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score, f1_score, roc_curve, confusion_matrix
import matplotlib.pyplot as plt
from PIL import Image
import cv2

# Set deterministic seed
tf.random.set_seed(42)
np.random.seed(42)

# Paths
ROOT_DIR = os.path.abspath("..")
MODEL_PATH = os.path.join("models", "maya_break_cnn_model.h5")
DATASET_DIR = os.path.join(ROOT_DIR, "dataset")

# Output Paths
OUT_DIR = os.path.join(ROOT_DIR, "client", "public", "cnn")
PLOTS_DIR = os.path.join(OUT_DIR, "plots")
FP_DIR = os.path.join(OUT_DIR, "analysis", "false_pos")
FN_DIR = os.path.join(OUT_DIR, "analysis", "false_neg")
GRADCAM_DIR = os.path.join(OUT_DIR, "analysis", "gradcam")
MODELS_OUT_DIR = os.path.join(OUT_DIR, "models")
METADATA_PATH = os.path.join(ROOT_DIR, "client", "metadata.json")

# Ensure directories exist
for d in [PLOTS_DIR, FP_DIR, FN_DIR, GRADCAM_DIR, MODELS_OUT_DIR]:
    os.makedirs(d, exist_ok=True)

# Dataset gathering
REAL_DIR = os.path.join(DATASET_DIR, "archive", "UADFV", "real", "frames")
FAKE_DIR = os.path.join(DATASET_DIR, "archive", "UADFV", "fake", "frames")
DOC_DIR = os.path.join(DATASET_DIR, "archive (1)", "dataset", "training_data", "images")
DOC_TEST_DIR = os.path.join(DATASET_DIR, "archive (1)", "dataset", "testing_data", "images")

# Subset for faster processing if needed
real_images = glob.glob(os.path.join(REAL_DIR, "**", "*.png"), recursive=True)[::50]
fake_images = glob.glob(os.path.join(FAKE_DIR, "**", "*.png"), recursive=True)[::50]
doc_images = glob.glob(os.path.join(DOC_DIR, "*.png"), recursive=True)[::10]
doc_test_images = glob.glob(os.path.join(DOC_TEST_DIR, "*.png"), recursive=True)[::10]

# Archive 2: Real and Fake images (e.g. documents/tampered images)
archive2_real = glob.glob(os.path.join(DATASET_DIR, "archive (2)", "**", "REAL", "*.jpg"), recursive=True)[::10]
archive2_fake = glob.glob(os.path.join(DATASET_DIR, "archive (2)", "**", "FAKE", "*.jpg"), recursive=True)[::10]

# Archive 3: Fake document images
archive3_fake = glob.glob(os.path.join(DATASET_DIR, "archive (3)", "**", "*.png"), recursive=True)[::5]

paths = real_images + fake_images + doc_images + doc_test_images + archive2_real + archive2_fake + archive3_fake
# 0 = Authentic/Real, 1 = Fake/Forgery
true_labels = ([0]*len(real_images) + [1]*len(fake_images) + [0]*len(doc_images) + [0]*len(doc_test_images) + 
               [0]*len(archive2_real) + [1]*len(archive2_fake) + [1]*len(archive3_fake))

# Load Model
model = tf.keras.models.load_model(MODEL_PATH)

results = []
y_true = []
y_pred_prob = []
y_pred_label = []

# To extract group_id, we can use the folder name or filename
print("Running inference...")
for i, path in enumerate(paths):
    img = Image.open(path).convert('RGB').resize((128, 128)) # Using 128x128 as the model was trained with this
    img_array = np.expand_dims(np.array(img) / 255.0, axis=0)
    
    score = float(model.predict(img_array, verbose=0)[0][0])
    label = 1 if score > 0.5 else 0
    
    group_id = os.path.basename(os.path.dirname(path)) if "UADFV" in path else "doc"
    
    rel_path = os.path.relpath(path, ROOT_DIR)
    
    results.append({
        "image_path": rel_path,
        "true_label": true_labels[i],
        "pred_score": score,
        "pred_label": label,
        "group_id": group_id
    })
    y_true.append(true_labels[i])
    y_pred_prob.append(score)
    y_pred_label.append(label)

# Save results.json
with open(os.path.join(OUT_DIR, "results.json"), "w") as f:
    json.dump(results, f, indent=2)

# Save aggregated.json
groups = {}
for r in results:
    gid = r["group_id"]
    if gid not in groups:
        groups[gid] = {"true_label": r["true_label"], "scores": []}
    groups[gid]["scores"].append(r["pred_score"])

aggregated = []
for gid, data in groups.items():
    mean_s = float(np.mean(data["scores"]))
    aggregated.append({
        "group_id": gid,
        "true_label": data["true_label"],
        "mean_score": mean_s,
        "agg_label": 1 if mean_s > 0.5 else 0
    })

with open(os.path.join(OUT_DIR, "aggregated.json"), "w") as f:
    json.dump(aggregated, f, indent=2)

# Metrics
try:
    roc_auc = roc_auc_score(y_true, y_pred_prob)
except:
    roc_auc = 0.5
acc = accuracy_score(y_true, y_pred_label)
prec = precision_score(y_true, y_pred_label, zero_division=0)
rec = recall_score(y_true, y_pred_label, zero_division=0)
f1 = f1_score(y_true, y_pred_label, zero_division=0)

# EER Calculation
fpr, tpr, thresholds = roc_curve(y_true, y_pred_prob)
fnr = 1 - tpr
eer_threshold = thresholds[np.nanargmin(np.absolute((fnr - fpr)))]
eer = fpr[np.nanargmin(np.absolute((fnr - fpr)))]

summary = {
    "n_samples": len(y_true),
    "class_counts": {"0 (Authentic)": y_true.count(0), "1 (Forgery)": y_true.count(1)},
    "roc_auc": float(roc_auc),
    "accuracy": float(acc),
    "precision": float(prec),
    "recall": float(rec),
    "f1": float(f1),
    "eer": float(eer),
    "timestamp": datetime.utcnow().isoformat()
}

with open(os.path.join(OUT_DIR, "summary.json"), "w") as f:
    json.dump(summary, f, indent=2)

# ROC Curve Plot
plt.figure()
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.2f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic')
plt.legend(loc="lower right")
plt.savefig(os.path.join(PLOTS_DIR, "roc.png"))
plt.close()

# Confusion Matrix Plot
cm = confusion_matrix(y_true, y_pred_label)
plt.figure()
plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
plt.title('Confusion Matrix')
plt.colorbar()
plt.xticks([0, 1], ['Authentic', 'Forgery'])
plt.yticks([0, 1], ['Authentic', 'Forgery'])
plt.ylabel('True label')
plt.xlabel('Predicted label')
for i in range(2):
    for j in range(2):
        plt.text(j, i, str(cm[i][j]), horizontalalignment="center", color="white" if cm[i][j] > cm.max()/2 else "black")
plt.savefig(os.path.join(PLOTS_DIR, "confusion.png"))
plt.close()

# FP and FN Analysis
fp_list = [r for r in results if r['true_label']==0 and r['pred_label']==1]
fn_list = [r for r in results if r['true_label']==1 and r['pred_label']==0]

# Sort by confidence
fp_list = sorted(fp_list, key=lambda x: x['pred_score'], reverse=True)[:50]
fn_list = sorted(fn_list, key=lambda x: x['pred_score'])[:50]

def make_thumbnail(src, dst):
    img = Image.open(src).convert('RGB').resize((200, 200))
    img.save(dst)

print("Generating False Positive/Negative Thumbnails...")
for idx, r in enumerate(fp_list):
    full_path = os.path.join(ROOT_DIR, r["image_path"])
    basename = os.path.basename(full_path)
    make_thumbnail(full_path, os.path.join(FP_DIR, f"{idx+1:02d}_{basename}"))

for idx, r in enumerate(fn_list):
    full_path = os.path.join(ROOT_DIR, r["image_path"])
    basename = os.path.basename(full_path)
    make_thumbnail(full_path, os.path.join(FN_DIR, f"{idx+1:02d}_{basename}"))

# Custom Grad-CAM implementation using GradientTape
print("Generating Grad-CAMs...")
def make_gradcam_heatmap(img_array, model, last_conv_layer_name):
    grad_model = tf.keras.models.Model(
        [model.inputs], [model.get_layer(last_conv_layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        class_channel = preds[:, 0]
    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def save_gradcam(src_path, dst_path, model):
    img = Image.open(src_path).convert('RGB').resize((128, 128))
    img_array = np.expand_dims(np.array(img) / 255.0, axis=0)
    try:
        # Find the last conv layer
        last_conv = None
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv = layer.name
                break
        heatmap = make_gradcam_heatmap(img_array, model, last_conv)
        heatmap = cv2.resize(heatmap, (128, 128))
        heatmap = np.uint8(255 * heatmap)
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        original_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        superimposed = cv2.addWeighted(original_img, 0.6, heatmap, 0.4, 0)
        
        sidebyside = np.hstack((original_img, superimposed))
        cv2.imwrite(dst_path, sidebyside)
    except Exception as e:
        print("GradCAM error:", e)

for r in fp_list[:10] + fn_list[:10]:
    full_path = os.path.join(ROOT_DIR, r["image_path"])
    grad_path = os.path.join(GRADCAM_DIR, f"{r['group_id']}_sidebyside.jpg")
    save_gradcam(full_path, grad_path, model)

# Model Card
model_card = f"""# Model Card: maya_break_cnn_model.h5
**Version:** 1.0
**Architecture:** Custom Convolutional Neural Network (Keras)
**Input:** RGB Images (128x128), normalized to [0, 1]

## Training Data Summary
* Total Samples Analyzed: {len(y_true)}
* Authentic (Class 0): {y_true.count(0)}
* Forgery (Class 1): {y_true.count(1)}
* Datasets: UADFV (Videos), FUNSD (Documents mapped to authentic)

## Performance Metrics
* ROC-AUC: {roc_auc:.4f}
* Accuracy: {acc:.4f}
* F1 Score: {f1:.4f}

## Intended Use & Limitations
Intended for internal forensic verification. Not intended as the sole decider for legal validity.
"""
with open(os.path.join(MODELS_OUT_DIR, "model_card.md"), "w") as f:
    f.write(model_card)

# Package Zip
zip_path = os.path.join(MODELS_OUT_DIR, "model_v1_package.zip")
with zipfile.ZipFile(zip_path, 'w') as z:
    z.write(MODEL_PATH, "maya_break_cnn_model.h5")
    z.write(os.path.join(MODELS_OUT_DIR, "model_card.md"), "model_card.md")

# Run commands & Info
with open(os.path.join(OUT_DIR, "run_commands.txt"), "w") as f:
    f.write("python posttrain_workflow.py\n# Note: Resized images to 128x128 because the H5 model was trained with that dimension.\n")

os.system(f"pip freeze > {os.path.join(OUT_DIR, 'run_info.txt')}")

# Update metadata.json
if os.path.exists(METADATA_PATH):
    try:
        with open(METADATA_PATH, "r") as f:
            metadata = json.load(f)
    except:
        metadata = {}
else:
    metadata = {}

metadata["cnn_page"] = {
    "latest_model": "maya_break_cnn_model.h5",
    "results_path": "cnn/results.json",
    "aggregated_path": "cnn/aggregated.json",
    "summary_path": "cnn/summary.json",
    "plots": {
        "roc": "cnn/plots/roc.png",
        "confusion": "cnn/plots/confusion.png"
    },
    "analysis_dir": "cnn/analysis",
    "model_package": "cnn/models/model_v1_package.zip",
    "last_updated": datetime.utcnow().isoformat()
}

with open(METADATA_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

print("Post-training workflow completed!")
