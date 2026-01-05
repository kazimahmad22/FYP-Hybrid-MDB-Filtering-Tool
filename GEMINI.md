# Gemini Project Context: Hybrid MDB Filtering Tool

## Project Overview

This project is a browser-based tool designed to enhance the Moderated Discussion Board (MDB) within a Learning Management System (LMS). Its primary purpose is to automatically detect, filter, and highlight non-academic messages (e.g., "good," "done," "present") to improve productivity for faculty members.

The system consists of two main components:
1.  **Mock MDB Interface (`MDB Interface/`)**: A static HTML/CSS/JS application that simulates the LMS discussion board environment. This is the target for the browser extension.
2.  **Browser Extension (`Hybrid MDB Filtering Tool - Extention/`)**: A Chrome Extension that injects scripts into the mock MDB page. It provides a UI for managing filters and dynamically highlights or filters posts based on user-defined keywords.

The project plan includes implementing two filtering approaches: a simple keyword-based system (currently in progress) and a more advanced AI/NLP classifier.

### Core Technologies
*   **Frontend**: HTML5, CSS3, JavaScript (ES6+)
*   **Browser Extension**: Chrome Extension API (Manifest V3)
*   **Planned for AI/Data**: Python, pandas, scikit-learn

## Building and Running

This project does not have a conventional build step. To run it, you need to set up the two components concurrently.

### 1. Run the Mock MDB Interface
The mock interface is a static website. You must serve the `MDB Interface/` directory from a local web server. The extension is configured to run on `http://127.0.0.1:5501`.

**Example using Python's built-in web server:**
```bash
# Navigate to the MDB Interface directory
cd "MDB Interface"

# Start the server on port 5501
python -m http.server 5501
```

### 2. Load the Browser Extension
1.  Open a Chromium-based browser (like Google Chrome).
2.  Navigate to `chrome://extensions`.
3.  Enable **"Developer mode"** using the toggle switch in the top-right corner.
4.  Click on the **"Load unpacked"** button.
5.  Select the `Hybrid MDB Filtering Tool - Extention/` directory.

Once both are running, navigate to `http://127.0.0.1:5501` in your browser. The extension will be active, and you can use its icon in the toolbar to open the management popup.

## Development Conventions

*   **Extension Logic**: The core logic is separated into a popup script (`popup.js`) for UI and data management, and a content script (`content.js`) for DOM manipulation on the target page.
*   **Communication**: The popup and content script communicate via `chrome.storage.sync`. `popup.js` writes settings (enabled status, keywords) to storage, and `content.js` listens for these changes to dynamically update its behavior. For one-off actions like exporting data, the scripts use `chrome.tabs.sendMessage`.
*   **DOM Targeting**: The `content.js` script targets `div` elements with the class `message` within the mock interface to apply its filtering logic.
*   **Configuration**: The extension's behavior (e.g., target URL) is defined in `manifest.json`.
*   **Styling**: The UI is styled with plain CSS. The popup has a fixed width, and styles for UI components like the toggle switch and keyword list are located in `popup.css`.
