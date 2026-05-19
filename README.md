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

## 🚀 Installation & Developer Setup

### Prerequisites
- **Node.js** (LTS)
- **Chrome Browser**

### Phase 1: AI & Knowledge Base Setup
1.  Navigate to the AI Model directory and install dependencies:
    ```bash
    cd AI_Model && npm install
    ```
2.  **Train Noise Classifier**:
    ```bash
    node train_model.js
    ```
3.  **Start AI Server** (Port 3000):
    ```bash
    node server.js
    ```

### Phase 2: Mock LMS Setup
1.  Navigate to the root and install base dependencies:
    ```bash
    npm install
    ```
2.  **Start LMS Server** (Port 5501):
    ```bash
    node lms_server.js
    ```

### Phase 3: Extension Deployment
1.  Open `chrome://extensions/` in Chrome.
2.  Enable **Developer Mode**.
3.  Click **Load Unpacked** and select the `Hybrid MDB Filtering Tool - Extention` folder.

---

## 🛠 Usage Guide

### 1. Hybrid Intelligence
- **Noise Filtering**: The system uses a Naive Bayes model to detect social noise/spam. Technical questions starting with polite greetings (e.g., "Hello sir...") are accurately identified as academic.
- **AI Auto-Reply (RAG)**: If a student asks a networking question (e.g., "What is Ethernet?"), the RAG engine retrieves context from the `CS610_Handout.json` and provides an automated, course-specific answer.

### 2. Instructor Dashboard
- Access the dashboard via the extension popup. It allows you to:
    - View **performance analytics** (Regex vs. AI).
    - Manage **student queries** in real-time.
    - **Re-scan all queries** to apply updated filtering rules.
- **Admin Credentials**: Email/User: `admin@gmail.com` | Password: `12345`

---

## 📖 Developer Handover 

### Updating the Knowledge Base
To add more networking topics, edit `Dataset/CS610_Handout.json`. The RAG engine will automatically re-index the content upon AI server restart.

### Design System
The UI follows a professional **Neutral Minimalist** aesthetic (Light Gray, White, Dark Text, Black accents) to fit seamlessly into any academic environment.

---

## 📝 License
This project is part of a Final Year Project (FYP) for research and educational purposes.
