Hybrid MDB Filtering Tool 

Project Overview
The Moderated Discussion Board (MDB) in VU’s LMS is frequently cluttered with non-academic responses such as “good,” “done,” “present,” or phone numbers for WhatsApp groups. These messages reduce efficiency for faculty who must manually review hundreds of posts. This project proposes developing a browser-based tool integrated with the LMS front-end to automatically detect, filter, and optionally reply to non-academic messages. The solution will improve faculty productivity and maintain the MDB’s academic integrity. Simulate MDB data using mock HTML pages or exported static content.
1.	Collect and label a dataset of sample MDB messages (academic vs. non-academic).
2.	Implement two filtering approaches: a keyword-based system and an AI-powered classifier then compare performance.
Users and Roles
Admin:
•	Manage global keyword list.
•	Update AI models.
•	Set default filtering behavior.
Faculty Members:
•	Use the tool for filtering MDB messages.
•	Manage keyword list locally.
•	Review and evaluate AI-classified results.
Functional Requirements
1.	Dataset Creation Module:
o	Collect at least 500–1,000 sample messages (synthetic or crowdsourced), labeled as academic or non-academic.
o	Store datasets in CSV or JSON format.
2.	Keyword-Based Filtering:
o	Implement regex-based filtering for known patterns (good, done, present, sir, phone numbers).
o	Provide a toggle to enable/disable keyword filtering.
3.	AI/NLP-Based Classification:
o	Use TF-IDF + Logistic Regression or Naïve Bayes for classification (Python + scikit-learn).
o	Optionally experiment with BERT or DistilBERT for advanced filtering.
o	Display model accuracy (precision, recall, F1-score).

4.	Comparison Dashboard:
o	Provide metrics comparing keyword filtering and AI classification accuracy.
o	Allow faculty to review misclassified examples.
5.	Mock LMS Integration:
o	Build a static MDB interface (HTML/JS/CSS) to simulate the LMS environment.
o	Inject filtering functionality via a browser extension or userscript.
6.	Export Feature:
o	Export filtered academic queries into CSV or text.
Tools / Languages / Frameworks
Component	Technology
Front-End	JavaScript (ES6+), HTML5, CSS3
Browser Extension	Tampermonkey or Chrome Extension API
Dataset Handling	Python (pandas, scikit-learn)
NLP/ML Classification	scikit-learn, spaCy, or TensorFlow.js
Visualization	Chart.js or D3.js
Version Control	Git + GitHub/GitLab
Expected Outcomes
•	A dual-filtering system: keyword-based for simplicity and ML-based for adaptability.
•	Demonstrates AI and front-end skills without requiring LMS backend access.
•	A reusable dataset of MDB-like messages for future research or improvements.
