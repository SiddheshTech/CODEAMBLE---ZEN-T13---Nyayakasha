# Model Card: maya_break_cnn_model.h5
**Version:** 1.0
**Architecture:** Custom Convolutional Neural Network (Keras)
**Input:** RGB Images (128x128), normalized to [0, 1]

## Training Data Summary
* Total Samples Analyzed: 2521
* Authentic (Class 0): 1051
* Forgery (Class 1): 1470
* Datasets: UADFV (Videos), FUNSD (Documents mapped to authentic)

## Performance Metrics
* ROC-AUC: 0.9527
* Accuracy: 0.8600
* F1 Score: 0.8708

## Intended Use & Limitations
Intended for internal forensic verification. Not intended as the sole decider for legal validity.
