# Gemini Project Context: Hybrid MDB Filtering Tool

## Project Overview
This project is a browser-based tool to enhance the Moderated Discussion Board (MDB) in an LMS. It filters non-academic "noise" (like "good", "done", "present") using **Hybrid** methods:
1.  **Rule-Based**: Keywords and Regex (e.g., Phone numbers).
2.  **AI-Based**: Machine Learning model trained on message context.

## 📅 Project Progress (As of May 18, 2026)

| Phase | Component | Status | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundation** | ✅ Completed | HTML, CSS, Manifest V3 |
| **Phase 2** | **Rule-Based Filter** | ✅ Completed | JavaScript, Regex |
| **Phase 6** | **UI Rebranding** | ✅ Completed | CSS (60-30-10 Neutral) |
| **Phase 3** | **Dataset Creation** | ✅ Completed | Node.js (Synthetic Generation) |
| **Phase 4** | **AI Classification** | ✅ Completed | Node.js (Natural/Bayes), Express |
| **Phase 5** | **Dashboards & Sync** | ✅ Completed | Chart.js, chrome.storage |
| **Phase 7** | **Post-Launch Refinement**| ✅ Completed | Enhanced Reply Threads & UI |

## 🛠 Feature Details

### ✅ Dataset Creation (Phase 3) - COMPLETE
*   **Source**: Synthetic generation using template injection (`Dataset/data_collector.js`).
*   **Size**: 1,000 Messages.
*   **Balance**: 50% Academic (Questions), 50% Non-Academic (Spam).
*   **Format**: `labeled_messages.csv`.

### ✅ UI Branding & Role-Based UX (Phase 6/7) - COMPLETE
*   **Theme**: Neutral, Minimal, Professional (Light Gray, White, Dark Text, Black Accents).
*   **Dynamic Headers**: 
    *   **Admin**: "Filtering Performance Dashboard"
    *   **Instructor**: "Instructor Dashboard"
    *   **Student**: "Student Dashboard"
*   **Student Identity**: Automatic **(You)** tag detection in Mock LMS based on unique Student IDs to distinguish users with same names.

### ✅ AI Classification & Reply System (Phase 4/7) - COMPLETE
*   **Engine**: Naive Bayes Classifier using the `natural` library.
*   **Reply Threads**: Supports multiple threaded responses with **ISO Timestamps**.
*   **Sorting**: All dashboards (Instructor/Student/LMS) sort replies in **Reverse-Chronological** order (latest first).
*   **Storage**: Fully synchronized between `chrome.storage.local` and `lms_server.js` (queries.json).

### ✅ Analytics Dashboard (Phase 5/7) - COMPLETE
*   **Streamlined Stats**: Balanced 3-column layout showing:
    1.  **Total Messages**
    2.  **Academic**
    3.  **Non-Academic (Regex - AI)**: Merged metric showing hybrid efficacy.
*   **Charts**: Real-time distribution and method comparison (Chart.js), excluding secondary "caught-by-both" noise for better focus.

## 📂 Project Structure
*   `MDB Interface/` - Mock LMS Website (`index.html`) with interactive query threads.
*   `Hybrid MDB Filtering Tool - Extention/` - Chrome extension (v3) with unified dashboards.
*   `Dataset/` - Synthetic generation scripts and master CSV.
*   `AI_Model/` - Node.js training and prediction API server.
*   `lms_server.js` - Backend for persisting discussion board data.

## 🚀 How to Run
1.  **LMS Server**: `node lms_server.js` (Runs on Port 5501).
2.  **AI Server**: `cd AI_Model && node server.js` (Runs on Port 3000).
    *   *Note: Ensure you have run `node train_model.js` first to generate `model.json`.*
3.  **Extension**: Load unpacked extension from the `Hybrid MDB Filtering Tool - Extention` folder in Chrome.
4.  **Usage**: 
    *   Toggle Rule-based or AI-based filtering in the extension popup.
    *   Use the **"Dashboard"** link for Role-specific features (Statistics, Response Management, User Administration).
    *   Admin Credentials: `admin@vu.edu.pk` | `password123`