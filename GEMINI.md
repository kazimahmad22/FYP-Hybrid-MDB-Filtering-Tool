# Gemini Project Context: Hybrid MDB Filtering Tool

## Project Overview
This project is a browser-based tool to enhance the Moderated Discussion Board (MDB) in an LMS. It filters non-academic "noise" (like "good", "done", "present") using **Hybrid** methods:
1.  **Rule-Based**: Keywords and Regex (e.g., Phone numbers).
2.  **AI-Based**: Machine Learning model trained on message context.

## 📅 Project Progress (As of February 4, 2026)

| Phase | Component | Status | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundation** | ✅ Completed | HTML, CSS, Manifest V3 |
| **Phase 2** | **Rule-Based Filter** | ✅ Completed | JavaScript, Regex |
| **Phase 6** | **UI Redesign** | ✅ Completed | CSS (60-30-10 Neutral) |
| **Phase 3** | **Dataset Creation** | ✅ Completed | Node.js (Synthetic Generation) |
| **Phase 4** | **AI Classification** | ⏳ **Next Up** | Node.js (Natural/Bayes), Express |
| **Phase 5** | **Dashboard** | 🔴 Pending | Chart.js |

## 🛠 Feature Details

### ✅ Dataset Creation (Phase 3) - COMPLETE
*   **Source**: Synthetic generation using template injection (`Dataset/data_collector.js`).
*   **Size**: 1,000 Messages.
*   **Balance**: 50% Academic (Questions), 50% Non-Academic (Spam).
*   **Format**: `labeled_messages.csv`.

### ✅ UI Redesign (Phase 6) - COMPLETE
*   **Theme**: Neutral, Minimal, Professional.
*   **Palette**: Light Gray (`#f8f9fa`), White (`#fff`), Dark Text (`#343a40`), Black Accents (`#000`).
*   **Typography**: Clean sans-serif (Inter/system-ui).

### ⏳ AI Classification (Phase 4) - PLANNED
*   **Architecture Change**: Switched from Python to **Node.js** due to environment constraints.
*   **Model**: Naive Bayes Classifier.
*   **Server**: Local Express API (`localhost:3000/predict`).

## 📂 Project Structure
*   `MDB Interface/` - Mock LMS Website.
*   `Hybrid MDB Filtering Tool - Extention/` - Browser Extension.
*   `Dataset/` - Generators and CSV Data.
*   `AI_Model/` - (Coming Soon) Training scripts and API.

## 🚀 How to Run
1.  **Mock LMS**: `node -e "require('http').createServer(..."` (Runs on Port 5501).
2.  **Extension**: Load unpacked extensions in Chrome.
3.  **Coming Soon**: `node AI_Model/server.js` for intelligent filtering.