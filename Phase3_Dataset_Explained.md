# Phase 3: Dataset Creation Explained

## 🧠 Simple Explanation (The "What" and "Why")

### What did we do?
Imagine you want to teach a child to recognize an apple. You can't just say "it's red" because a fire truck is also red. You have to show them *examples*: "This is an apple, this is a fire truck."

In Phase 3, we successfully created those **examples** for our computer.
We generated **1,000 messages** that look like real student posts using a script.
*   500 are **Academic** (Valid questions: "Sir, I don't understand...").
*   500 are **Non-Academic** (Useless noise: "Good", "Done", "Present").

### Why did we do it?
We want to build an "Artificial Intelligence" (AI) in Phase 4. Unlike the "Keyword Filter" (Phase 2) which just looks for specific words like "Good", an AI needs to *read* a lot of examples to learn the *difference* between a helpful question and a useless comment. Without this list of 1,000 examples (the Dataset), the AI cannot learn.

---

## 💼 Professional Explanation (Technical Details)

### Objective
To generate a balanced, labeled corpus of text data suitable for Supervised Machine Learning (Classification).

### Implementation Details
*   **Methodology**: Synthetic Data Generation via Template Injection.
*   **Script**: `Dataset/data_collector.js` (Node.js).
*   **Output**: `Dataset/labeled_messages.csv` (CSV Format).
*   **Volume**: 1,000 records.
*   **Class Balance**: 50/50 split (Binary Classification).
    *   `Label 0` (Negative Class): Academic/Relevant content.
    *   `Label 1` (Positive Class): Non-Academic/Spam content.

### Technical Value
This dataset resolves the "Cold Start" problem. Since we cannot access private LMS data due to privacy/policy constraints, this synthetic dataset serves as a proxy for training the initial MVP model. It allows us to implement the **TF-IDF (Term Frequency-Inverse Document Frequency)** vectorization pipeline in Phase 4.
