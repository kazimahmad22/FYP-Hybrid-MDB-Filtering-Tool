# Gemini Project Context: Hybrid MDB Filtering Tool

## Project Overview
This project is a browser-based tool to enhance the Moderated Discussion Board (MDB) in an LMS. It filters non-academic "noise" (like "good", "done", "present") using **Hybrid** methods:
1.  **Rule-Based**: Keywords and Regex (e.g., Phone numbers).
2.  **AI-Based**: Machine Learning model trained on message context.

## 📅 Project Progress (As of April 12, 2026)

| Phase | Component | Status | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundation** | ✅ Completed | HTML, CSS, Manifest V3 |
| **Phase 2** | **Rule-Based Filter** | ✅ Completed | JavaScript, Regex |
| **Phase 6** | **UI Redesign** | ✅ Completed | CSS (60-30-10 Neutral) |
| **Phase 3** | **Dataset Creation** | ✅ Completed | Node.js (Synthetic Generation) |
| **Phase 4** | **AI Classification** | ✅ Completed | Node.js (Natural/Bayes), Express |
| **Phase 5** | **Dashboard** | ✅ Completed | Chart.js |

## 🛠 Feature Details

### ✅ Dataset Creation (Phase 3) - COMPLETE
*   **Source**: Synthetic generation using template injection (`Dataset/data_collector.js`).
*   **Size**: 1,000 Messages.
*   **Balance**: 50% Academic (Questions), 50% Non-Academic (Spam).
*   **Format**: `labeled_messages.csv`.

### ✅ UI Redesign & Accessibility (Phase 6) - COMPLETE
*   **Theme**: Neutral, Minimal, Professional.
*   **Palette**: Light Gray (`#f8f9fa`), White (`#fff`), Dark Text (`#343a40`), Black Accents (`#000`).
*   **Audit**: Verified against WCAG 2.1 Level AA (Contrast ≥ 4.5:1).
*   **Fixes**: Improved contrast for Stat Labels and Logout actions for full accessibility.

### ✅ AI Classification (Phase 4) - COMPLETE
*   **Engine**: Naive Bayes Classifier using the `natural` library.
*   **Dataset**: Trained on 1,000 labeled messages from Phase 3.
*   **Backend**: Local Express API server running on `localhost:3000`.
*   **Integration**: Extension performs asynchronous fetching from the backend and applies **Orange** highlighting for AI-flagged spam.

### ✅ Evaluation & Dashboard (Phase 5) - COMPLETE
*   **Visuals**: High-resolution charts (Chart.js) comparing Rule-based vs. AI-based efficacy.
*   **User Management**: Included a robust role-based simulation system (Admin/Instructor/Student) for testing.

## 📂 Project Structure
*   `MDB Interface/` - Mock LMS Website with 35 test posts.
*   `Hybrid MDB Filtering Tool - Extention/` - Chrome extension (v3) with Regex & AI toggles.
*   `Dataset/` - `labeled_messages.csv` and the generation script.
*   `AI_Model/` - Training script (`train_model.js`), trained weights (`model.json`), and API server (`server.js`).

## 🚀 How to Run
1.  **LMS Server**: `node lms_server.js` (Runs on Port 5501).
2.  **AI Server**: `cd AI_Model && node server.js` (Runs on Port 3000).
    *   *Note: Ensure you have run `node train_model.js` first to generate `model.json`.*
3.  **Extension**: Load unpacked extension from the `Hybrid MDB Filtering Tool - Extention` folder in Chrome.
4.  **Usage**: Open the Mock LMS (`http://localhost:5501`) and use the extension popup to toggle Rule-based or AI-based filtering.
5.  **Dashboard**: Access the extension dashboard to view real-time filtering analytics and manage users.