# Implementation Plan: Hybrid MDB Filtering Tool (Phases 3-5)

## Goal Description
To complete the Hybrid MDB Filtering Tool by implementing an AI-based classification system, creating a labeled dataset, and building a comparison dashboard to evaluate the performance of rule-based vs. AI-based filtering.

## User Review Required
> [!IMPORTANT]
> **AI Architecture Decision**: We need to decide between a **Server-less** approach (TensorFlow.js running in the browser) or a **Backend** approach (Flask/Python + scikit-learn).
> * Recommendation: **TensorFlow.js** for a pure "browser-based" experience without needing a Python server running, OR a hybrid approach where Python is used for *training* updates but inference happens in JS.
> * Current Assumption: We will use Python for offline training and dataset management, and port the model or use a simple local Flask server for the "Mock" environment.

## Proposed Changes

### Phase 3: Dataset Creation (Foundational)
The AI model needs data. We will create a simple utility to generate or collect this data.
#### [NEW] Dataset/
*   Create a folder `Dataset/` to store raw and processed data.
*   **`data_collector.py`**: A simple script to help quickly label text.
    *   Input: A list of raw strings (or manual entry).
    *   Output: `labeled_messages.csv` with columns `message_content`, `label` (0=Academic, 1=Non-Academic).
*   **Target**: 500-1000 messages.

### Phase 4: AI/NLP-Based Classification
#### [NEW] AI_Model/
*   **`train_model.py`**: Python script to:
    1.  Load `labeled_messages.csv`.
    2.  Preprocess text (lower case, remove punctuation).
    3.  Train TF-IDF + Logistic Regression/Naïve Bayes.
    4.  Evaluate metrics (Precision, Recall).
    5.  **Export**: Save the model (pickle for Python, or JSON weights for JS).
*   **`app.py` (Local Inference Server)**:
    *   Simple Flask server exposing `POST /predict`.
    *   Receives message text, returns `{"is_academic": boolean, "confidence": float}`.

#### [MODIFY] Hybrid MDB Filtering Tool - Extention/
*   **`popup.html/js`**:
    *   Add "AI Filtering" toggle (initially disabled).
    *   Add status indicator for Backend connection.
*   **`content.js`**:
    *   Fetch classification from `http://127.0.0.1:5000/predict` (if using backend approach).
    *   Apply highlighting based on AI result (different color? e.g., Orange for AI-flagged, Yellow for Regex-flagged).

### Phase 5: Evaluation & Comparison Dashboard
#### [MODIFY] MDB Interface/
*   **`dashboard.html`**: New page or section in the mock interface.
    *   **Charts**: Bar chart comparing "Messages Flagged by Keyword" vs "Messages Flagged by AI".
    *   **Table**: "Discrepancy Log" – Messages where AI and Keyword disagreed.
*   **`content.js`**:
    *   Log classification results to LocalStorage or send to the Dashboard page.

## Verification Plan

### Automated Tests
*   **Model Accuracy**: `train_model.py` will output F1-score. Target > 0.85.
*   **Integration Test**: Verify `content.js` can successfully hit the `predict` endpoint and receive a response.

### Manual Verification
1.  **Dataset**: Verify CSV file exists with >500 rows.
2.  **Filtering**:
    *   Turn Regex OFF, AI ON. Reload MDB. Check if "good work" is filtered.
    *   Turn Regex ON, AI OFF. Verify same behavior.
3.  **Dashboard**: Open dashboard and ensure charts render with mock data.
