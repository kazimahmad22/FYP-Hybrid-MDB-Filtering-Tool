# FYP Master Guide: Hybrid MDB Filtering Tool

This document is your ultimate cheat sheet and learning roadmap to prepare for your Final Viva. It breaks down the entire project's architecture, logic, how to modify it live, and how to defend your technical decisions.

---

## 1. Architecture Overview 🏗️
The project uses a **decoupled, hybrid architecture** consisting of three main independent moving parts:

1. **The Mock LMS (`MDB Interface/`)**: A simple local web server that hosts an HTML page mimicking a university Moderated Discussion Board. It contains dummy posts with static HTML structures (`<div class="message">`).
2. **The Output API / AI Engine (`AI_Model/`)**: A decoupled backend Node.js server powered by Express. It uses the `natural` NLP library to run a pre-trained **Naïve Bayes Classification** model. It listens on port `3000` for incoming texts, evaluates them, and returns `{ label: 'non-academic' }` or `'academic'`.
3. **The Chrome Extension (`Hybrid MDB Filtering Tool - Extention/`)**: The bridge that connects everything.
    * **`manifest.json`**: The rulebook. Tells Chrome it's a Manifest V3 extension, declares permissions (like `storage`), and registers scripts.
    * **`popup.js / popup.html`**: The UI the user sees when clicking the extension icon. It saves settings (keywords, toggles) to `chrome.storage.sync`.
    * **`content.js`**: The true workhorse. Injected *directly* into the Mock LMS page. It reads the page's HTML, applies Regex logic, calls the AI server, and manually alters the page's CSS (background colors) to highlight spam. It then saves statistics to `chrome.storage.local`.
    * **`dashboard.js / dashboard.html`**: A simulated admin environment packed inside the extension. It pulls the statistics saved by `content.js` and visualizes them using Chart.js.

---

## 2. Logic Breakdown: How Data Flows ⚙️

### A. The Filtering Logic (`content.js`)
When you load the Mock LMS page, `content.js` runs automatically. Here is exactly what it does in plain English:
1. **Reset**: Uses `document.querySelectorAll('.message')` to reset any existing background colors.
2. **Setup**: Gathers the keywords from memory and converts them into Regular Expressions (Regex).
3. **Iterate**: Loops through every single `.post` on the page.
    * Extracts text.
    * **Rule-based execution**: Checks if the text matches *any* regex keyword. If yes, it sets a boolean `flaggedByRegex = true`.
    * **AI-based execution**: Sends an HTTP `POST` request (`fetch`) containing the text to your AI Model (`http://localhost:3000/predict`). The server responds. If the AI flags it, it sets `flaggedByAI = true`.
4. **Evaluate & Paint**: 
    * If both flagged it -> Paint it **Light Blue**.
    * If Regex only -> Paint it **Yellow**.
    * If AI only -> Paint it **Orange**.
    * If neither -> It's a safe academic message! Append it to a safe list for CSV exporting.
5. **Report**: Sends the finalized math (how many were caught by what method) to `chrome.storage.local`.

### B. The Machine Learning Logic (`train_model.js` & `server.js`)
1. **Training (`train_model.js`)**: Reads your `labeled_messages.csv` dataset. Feeds the data into the natural language processor. The library mathematically calculates the probability of specific words appearing in "academic" vs "non-academic" contexts. It exports these probabilities into `model.json`.
2. **Serving (`server.js`)**: An Express API that imports `model.json`. When a network request hits the `/predict` route, it runs the probability math on the new unseen text and spits out the most likely label.

---

## 3. Modification Guide (Live Viva Defense) 🛑
Your supervisor may ask you to prove you coded it by making live changes. Memorize these files:

### Live Scenario 1: "Change the highlight colors."
* **Where to go:** `Hybrid MDB Filtering Tool - Extention/content.js`
* **What to change:** Scroll to the `// Apply styling` section (around line 75). Change `messageElement.style.backgroundColor = 'yellow'` to a hex code like `messageElement.style.backgroundColor = '#ff0000'` (for red).
* **Next Step:** To see the change, you **MUST** go to `chrome://extensions`, click the little "Refresh" arrow icon on your extension card, and then refresh the Mock LMS page.

### Live Scenario 2: "Add a new default keyword to the filter."
* **Where to go:** `Hybrid MDB Filtering Tool - Extention/content.js` and `popup.js`.
* **What to change:** Find `const defaultKeywords = ["good", "present", "done", "sir"];`. Add your new word in quotes to the array: `... "sir", "yes"]`.

### Live Scenario 3: "Make the toast notifications stay longer."
* **Where to go:** `Hybrid MDB Filtering Tool - Extention/dashboard.js` and `popup.js`
* **What to change:** Locate the `showGlobalToast` function. There is a `setTimeout` wrapping `toast.remove()`. Change the `3000` (which is 3 seconds in milliseconds) to `5000` (5 seconds).

### Live Scenario 4: "Change the text of the Dashboard titles."
* **Where to go:** `Hybrid MDB Filtering Tool - Extention/dashboard.html`
* **What to change:** Open the HTML file, locate `<h1>Filtering Performance Dashboard</h1>`, change the text, save the file, and refresh the dashboard page. No need to reload the extension for straight HTML changes in a tab.

---

## 4. Viva Prep & Professional Answers 🎓

### Technical Terminology to Know:
* **Manifest V3:** The latest specification for writing Google Chrome Extensions, emphasizing privacy and security by strictly limiting background scripts and inline execution.
* **Content Script:** JavaScript that executes in the context of a webpage within an extension limit, manipulating the DOM (Document Object Model) of that page.
* **Naïve Bayes:** A probabilistic machine learning algorithm used commonly for text classification based on applying Bayes' theorem with strong (naïve) independence assumptions between the features (words).
* **Asynchronous / Promises (`async/await`):** A programming paradigm that allows Javascript to wait for operations that take time (like a network request to the AI server) without freezing or locking the entire user interface.

### Hard Supervisor Questions & Answers:

**Q: *Why did you build this as a Chrome Extension instead of natively modifying an LMS like Moodle?***
> **A:** "A Chrome Extension makes the tool universally adaptable and platform-agnostic. Modifying existing monolithic LMS systems requires deep integration, server access, and dealing with legacy spaghetti code. By injecting Javascript at the client surface (the browser), this tool can theoretically run on top of VU's LMS, Canvas, or Moodle interchangeably without needing server-side access to the institution's databases."

**Q: *Why did you choose Naïve Bayes as your AI Algorithm over something modern like a Neural Network (Deep Learning)?***
> **A:** "Deep learning algorithms, such as LLMs or Transformers, require immense computational power (GPUs), vast datasets spanning millions of parameters, and have high latency. Filtering simple "sir/yes/done" noise is a straightforward binary classification problem. Naïve Bayes is extremely lightweight, requires very little data to produce accurate mathematical probabilities, has sub-millisecond inference times, and can run natively inside a simple Node.js runtime without needing Python environments."

**Q: *Why separate `chrome.storage.sync` and `chrome.storage.local`?***
> **A:** "Chrome's `sync` storage automatically shares data across all computers where the user is logged in. However, it has very strict, tiny quota limits (around 100KB). Therefore, it is only optimal for saving small user preferences, like boolean toggles and keyword arrays. `local` storage stays on the machine but supports roughly 5MB by default. This is where I dumped bulk application stats gathered from the page processing so it doesn't throttle or break the sync quota."

**Q: *How do your Regex filters and AI filters talk to each other to generate that 'Caught by Both' blue color?***
> **A:** "They don't talk to each other; they evaluate in parallel. The content script grabs the text, tests it against the array of Regex rule patterns, storing the true/false result in a local scope variable. Concurrently, it dispatches an asynchronous network fetch to the backend Node server for the AI classification. Once the promise resolves, it checks the results of both insulated evaluations natively using standard boolean logic (`if (flaggedByRegex && flaggedByAI)`) to apply the overlapping CSS."
