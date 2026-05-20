# SOP: Hybrid MDB Filtering Tool Diagnostic & Recovery

This Standard Operating Procedure (SOP) outlines the steps to identify and fix issues within the Hybrid MDB Filtering system, specifically targeting failures in AI classification and RAG auto-replies.

---

## 🛠 Step 1: Environment & Dependencies Audit
**Goal**: Ensure all required libraries are installed and the environment is clean.

1.  **Verify Root Dependencies**:
    - Run `npm install` in the project root.
    - Check if `lms_server.js` starts: `node lms_server.js`.
2.  **Verify AI Backend Dependencies**:
    - Navigate to `AI_Model/`.
    - Run `npm install`.
    - Ensure `@xenova/transformers`, `natural`, and `wink-bm25-text-search` are present in `node_modules`.

## 🧠 Step 2: Model & Knowledge Base Integrity
**Goal**: Confirm that the AI models are trained and the knowledge data is accessible.

1.  **Re-train Noise Classifier**:
    - Delete `AI_Model/model.json` (if exists).
    - Run `node train_model.js`.
    - Confirm a new `model.json` is generated with valid content (not 0 bytes).
2.  **Validate Knowledge Base**:
    - Ensure `Dataset/CS610_Handout.json` is valid JSON and contains the `qaPairs` array.
3.  **Semantic Cache Check**:
    - Run `npm run download-model` to ensure the transformer model is cached in `AI_Model/.cache`.

## 📡 Step 3: Server Interaction & API Diagnostic
**Goal**: Test the communication between the front-end (Extension) and back-end (Express).

1.  **Start AI Server**: `npm start` (Port 3000).
    - Monitor logs for `[RAG] Ready!` and `Classification model loaded`.
2.  **Direct API Test**:
    - Use a tool like Postman or a simple `curl` to test the endpoint:
      `curl -X POST http://localhost:3000/predict -H "Content-Type: application/json" -d '{"text":"What is Ethernet?"}'`
    - Verify the response includes `label: "academic"` and `aiSuggestion`.

## 🧩 Step 4: Extension & Dashboard Linkage
**Goal**: Resolve UI-side failures in displaying or applying AI logic.

1.  **Storage Sync**:
    - Inspect the Extension background/popup page.
    - Check `chrome.storage.sync` to ensure `aiFilteringEnabled` is set to `true`.
    - **Note**: Ensure the toggle in the Extension Popup is switched **ON**. 
2.  **CORS Check**:
    - Check for console errors in the Chrome Extension indicating blocked requests to `localhost:3000`.

## 🩹 Step 5: Fixing Common Failures
- **Suggestion is Null**: The confidence threshold is 0.50. If the question is too vague, it stays silent.
- **Model Loading Stalls**: HF Rate limits (429). The system now has a retry & fallback mode.
- **LMS Server No Data**: Ensure `queries.json` exists or is initialized in the root.

---
*Created on: May 20, 2026*
