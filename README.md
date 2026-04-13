# testing fetch git feature

# Hybrid MDB Filtering Tool

A modern, comprehensive solution to enhance the Moderated Discussion Board (MDB) productivity in an LMS. This tool employs a **Hybrid Filtering Logic** (Rule-Based + AI-Based) to eliminate non-academic noise and highlight critical student queries.

---

## 📂 Repository Structure

The project has evolved through several phases, transitioning from a standalone prototype to a fully integrated Chrome Extension.

### 1. **Current Production System (Extension Tool)**
- **`Hybrid MDB Filtering Tool - Extention/`**: The core Chrome Extension (v3) containing the content script logic, popup interface, and the **Analytics & User Management Dashboard**.
- **`AI_Model/`**: The AI backend. Contains the Naive Bayes training script (`train_model.js`), the trained weights (`model.json`), and the Express-based prediction API (`server.js`).
- **`MDB Interface/`**: A high-fidelity mock LMS discussion board with pre-loaded students and posts for testing and demonstration.
- **`Dataset/`**: Tools for synthetic dataset generation (`data_collector.js`) and the master `labeled_messages.csv`.

### 2. **Legacy Components**
- **`prototype/`**: The initial "Phase 1" prototype. A standalone Python/Flask application that explored the conceptual design of user registration and role-based access before migrating to the extension-based architecture.

---

## 🚀 Installation & Developer Setup

### Prerequisites
- **Node.js** (LTS)
- **Chrome Browser**

### Phase 1: AI Backend Setup
1.  Navigate to the AI Model directory:
    ```bash
    cd AI_Model
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Train the Model**: Run the training script to analyze the `labeled_messages.csv` and generate the `model.json` file:
    ```bash
    node train_model.js
    ```
4.  **Start the AI Server** (listening on Port 3000):
    ```bash
    node server.js
    ```

### Phase 2: Mock LMS Setup
1.  Return to the project root.
2.  Launch the Mock LMS Server (listening on Port 5501):
    ```bash
    node lms_server.js
    ```

### Phase 3: Extension Deployment
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer Mode**.
3.  Click **Load Unpacked** and select the `Hybrid MDB Filtering Tool - Extention` folder.

---

## 🛠 Usage Guide

### 1. Filtering Logic
- **Regex Filter**: Managed via the extension popup. It flags common patterns (e.g., "Good", "Present", Phone numbers) and highlights them in **Yellow**.
- **AI Filter**: Uses the local Bayes classifier to analyze message context. It highlights flagged noise in **Orange**.

### 2. Analytics Dashboard
- Access the dashboard by clicking "Dashboard" in the extension popup.
- **Analytics**: Real-time comparison charts (Chart.js) showing the efficacy of Regex vs. AI filtering.
- **User Management**: A simulated role-based system (Admin/Instructor/Student) to test access control and user status (Active/Blocked).

---

## 📖 Developer Information

### Extending the Dataset
To improve AI accuracy, you can add new templates to `Dataset/data_collector.js` and regenerate the data:
```bash
node Dataset/data_collector.js 500  # Generates 500 additional messages
```
After generating new data, remember to **rerun `node AI_Model/train_model.js`** to update the model weights.

### Design System
The UI follows the **60-30-10 Neutral palette**:
- **Primary Bg**: `#f8f9fa` (Light Gray)
- **Surface**: `#ffffff` (White)
- **Accent**: `#000000` (Black)
- **Success/Danger**: Standard semantic colors with accessibility-tested contrast ratios.

---

## 📝 License
This project is part of a Final Year Project (FYP) for research and educational purposes.
