# 📝 Project Task List: Hybrid MDB Filtering Tool

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | **Foundation & UI** | ✅ Completed |
| **Phase 2** | **Rule-Based Filtering** | ✅ Completed |
| **Phase 6** | **UI/UX Redesign** | ✅ Completed |
| **Phase 3** | **Dataset Creation** | ✅ Completed |
| **Phase 4** | **AI/NLP Classification** | ⏳ **In Progress** |
| **Phase 5** | **Comparison Dashboard** | 🔴 Pending |

---

## ✅ Completed Tasks

### Phase 1: Foundation
- [x] Create Mock MDB Interface (HTML/CSS)
- [x] Initialize Browser Extension (Manifest V3)

### Phase 2: Rule-Based Filtering
- [x] Implement Keyword Filtering System
- [x] Add Regex Pattern Matching (e.g., Phone Numbers)
- [x] Create Export to CSV Feature

### Phase 6: UI Redesign (Neutral & Minimal)
- [x] Redesign `MDB Interface` (60-30-10 Rule, Light Theme)
- [x] Redesign `Extension Popup` (Clean, Minimal, Black Accent)
- [x] Setup Localhost Server for Testing

### Phase 3: Dataset Creation
- [x] **Setup**: Created `Dataset/` directory.
- [x] **Tooling**: Developed `data_collector.js` (Node.js script).
- [x] **Generation**: Generated 1,000 labeled messages (50% Academic, 50% Non-Academic).
- [x] **Output**: Saved data to `Dataset/labeled_messages.csv`.

---

## 🚀 Current Focus: Phase 4 (AI/NLP Classification)

**Goal**: Build a machine learning model to automatically classify messages without strict keywords.

- [ ] **Infrastructure**
    - [ ] Create `AI_Model/` directory.
    - [ ] Initialize Node.js project for AI (since Python is unavailable).

- [ ] **Model Training (JavaScript)**
    - [ ] Implement `train_model.js` (using `natural` or `bayes` library).
    - [ ] Train model on `labeled_messages.csv`.
    - [ ] Save trained classifier to a JSON file.

- [ ] **Inference Server**
    - [ ] Create `server.js` (Express/Node) to accept messages.
    - [ ] Endpoint: `POST /predict` -> Returns `{ class: 'academic', confidence: 0.95 }`.

- [ ] **Extension Integration**
    - [ ] Update `content.js` to send messages to the local server.
    - [ ] Highlight AI-detected non-academic messages (distinct color).

---

## 🔮 Future: Phase 5 (Evaluation)

**Goal**: Prove that AI is better/complementary to Rules.

- [ ] **Dashboard UI**: Add Charts/Graphs to MDB Interface.
- [ ] **Comparison Logic**: Log where Regex and AI disagree.
