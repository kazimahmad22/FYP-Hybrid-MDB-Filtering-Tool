# Phase 4: AI/NLP Classification (Next Steps)

## 🧠 Simple Explanation (The "What" and "Why")

### What are we doing next?
Now that we have the "examples" (the Dataset from Phase 3), we are going to build the "Brain" (the AI).
We will write a program that reading the 1,000 messages and learns patterns.
*   It learns that "thanks" usually appears in non-academic messages.
*   It learns that "question" usually appears in academic messages.

After it learns, we will connect it to the Browser Extension. When you open the LMS, the AI will whisper to the extension: *"Hey, hide this message, it looks like spam."*

### Why is this better than keywords?
Keywords are rigid. If you block "good", you might accidentally block "This is a **good** question."
AI understands *context*. It looks at the whole sentence. It can calculate the *probability* that a message is useful or not, which is much smarter.

---

## 💼 Professional Explanation (Technical Details)

### Objective
To implement a **Naïve Bayes Classifier** using Natural Language Processing (NLP) techniques to categorize messages dynamically.

### Key Components
1.  **Vectorization**: Converting raw text strings into numerical vectors (Bag of Words or TF-IDF). The computer cannot understand text, only math.
2.  **Training**: We will feed the `labeled_messages.csv` into a Node.js library (like `natural` or `bayes`). The model will calculate the conditional probability `P(Spam | Word)` for every word in our vocabulary.
3.  **Inference API**: We will build a lightweight **REST API** (using Express.js) listening on `localhost`.
    *   **Input**: JSON `{ "text": "Sir help me" }`
    *   **Output**: JSON `{ "label": "academic", "confidence": 0.89 }`
4.  **Integration**: The Chrome Extension (`content.js`) will make async `fetch()` calls to this API for every message on the screen to determine if it should be highlighted or hidden.

### Why Node.js?
Since the environment lacks a robust Python setup, we are leveraging the **JavaScript** ecosystem (`ml-bayes`, `natural`, `express`) which allows seamless integration with the existing Frontend and Extension architecture without additional dependencies.
