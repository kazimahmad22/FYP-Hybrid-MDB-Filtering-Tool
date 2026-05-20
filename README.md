# Hybrid MDB Filtering Tool

A modern, comprehensive solution to enhance the Moderated Discussion Board (MDB) productivity in an LMS. This tool employs a **Hybrid Filtering Logic** (Rule-Based + AI-Based) to eliminate non-academic noise and highlight critical student queries.

---

## 📂 Repository Structures

The project has evolved through several phases, transitioning from a standalone prototype to a fully integrated Chrome Extension.

### 2. **AI Backend & Semantic Engine**
- **`AI_Model/`**: The core intelligence hub.
    - `train_model.js`: Naive Bayes training script for noise classification.
    - `document_processor.js`: The **Hybrid Semantic + Keyword RAG** engine. Uses `transformers.js` for vector embeddings and `wink-bm25` for technical keyword matching.
    - `server.js`: Express API providing `/predict` (classification) and `/reply` (RAG) endpoints.
- **`Dataset/`**: Contains the synthetic data generator and the `CS610_Handout.json` knowledge base used by the RAG system.

### 3. **Mock LMS & Extension**
- **`Hybrid MDB Filtering Tool - Extention/`**: Chrome Extension (v3) with real-time filtering, automated AI replies, and a role-based dashboard.
- **`lms_server.js`**: Backend for the Mock LMS discussion board to persist queries and replies.

---

## 🚀 Getting Started

Follow these steps to set up the complete environment.

### 📋 Prerequisites
- **Node.js** (LTS version recommended)
- **Google Chrome** (for Extension testing)

---

### Phase 1: AI Engine & Knowledge Base
The AI server handles noise classification and semantic retrieval (RAG).

1.  **Install Dependencies**:
    ```bash
    cd AI_Model
    npm install
    ```

2.  **Download AI Model (Critical)**:
    Since the semantic RAG utilizes a 100MB transformer model, we recommend pre-downloading it to bypass potential connection issues or rate limits:
    ```bash
    npm run download-model
    ```
    *Note: If this step fails with a **429 Error**, don't worry! The server will automatically fall back to Keyword-Matching mode.*

3.  **Train the Noise Classifier**:
    Generate the internal classification model for academic vs. non-academic detection:
    ```bash
    node train_model.js
    ```

4.  **Start AI Server**:
    ```bash
    npm start
    ```
    The AI engine will be available at `http://localhost:3000`.

---

### Phase 2: Mock LMS Environment
This serves as the "Host Website" where students post queries.

1.  **Initialize Root Dependencies**:
    Navigate to the project root and run:
    ```bash
    npm install
    ```

2.  **Run LMS Server**:
    ```bash
    node lms_server.js
    ```
    The LMS will be accessible at `http://localhost:5501`.

---

### Phase 3: Chrome Extension Activation
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer Mode** (top-right toggle).
3.  Click **Load Unpacked**.
4.  Select the `Hybrid MDB Filtering Tool - Extention` folder.

---

## 🛠 Features & Resilience

### 🧠 Resilient RAG Engine
Our **Hybrid Semantic + Keyword Engine** is built for reliability:
- **Hybrid Mode**: Combines Vector Embeddings (Semantic) with BM25 (Keyword) for 0.90+ retrieval accuracy.
- **Resilient Fallback**: If Hugging Face is inaccessible or the model fails to load, the system automatically switches to **Keyword-Only mode**, ensuring the tool remains functional in offline or high-traffic environments.
- **Local Caching**: Once downloaded, models are stored in `AI_Model/.cache/` to ensure near-instant startup.

### 🛡 Filtering Intelligence
- **Naive Bayes Classification**: High-speed detection of "good", "done", "present" noise.
- **Polite-Greeting Handling**: Accurately classifies "Hello Sir, I have a question..." as academic instead of spam.
- **Admin Dashboard**: Comprehensive stats tracking Regex vs. AI performance metrics.
- **Admin Credentials**: `admin@gmail.com` | `12345`

---

## 📖 Handover Basics

- **Updating the Handout**: Edit `Dataset/CS610_Handout.json` to add new course material.
- **Adding Noise Keywords**: Update the regex patterns in `Hybrid MDB Filtering Tool - Extention/content.js`.
- **Revisiting Training Data**: If you need to re-train the AI, update the CSV in `Dataset/` and run `node train_model.js`.

---

## 📝 License & Purpose
Developed as a **Final Year Project (FYP)** to solve real-world engagement issues in Distance Learning environments.
