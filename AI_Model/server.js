const express = require('express');
const cors = require('cors');
const natural = require('natural');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const docProcessor = require('./document_processor');

// Initialize Gemini SDK
let GoogleGenerativeAI;
try {
    GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
} catch (e) {
    console.warn("Google Generative AI library not installed. Run: npm install @google/generative-ai");
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const PORT = 3000;
const MODEL_PATH = path.join(__dirname, 'model.json');

let classifier = null;

// 1. Load classification model
natural.BayesClassifier.load(MODEL_PATH, null, function(err, loadedClassifier) {
    if (err) {
        console.error('Failed to load classification model:', err.message);
    } else {
        classifier = loadedClassifier;
        console.log('Classification model loaded.');
    }
});

// 2. Load the Subject Material handled internally by DocumentProcessor.
// No longer need separate initSubjectMaterial call here as loadHandout is internal.

// 3. Main Prediction & Auto-Reply Endpoint
app.post('/predict', async (req, res) => {
    if (!classifier) {
        return res.status(503).json({ error: 'Classification model not loaded.' });
    }

    const text = req.body.text;
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Please provide valid text.' });
    }

    // 1. Classification (Academic vs Noise)
    const classification = classifier.classify(text);
    
    // 2. Hybrid RAG Retrieval (Academic Only)
    let aiSuggestion = null;
    if (classification === 'academic' && docProcessor.isReady) {
        try {
            // Await the semantic/BM25 combined search result
            aiSuggestion = await docProcessor.findContext(text);
        } catch (err) {
            console.error("[RAG] Match error:", err);
        }
    }
    
    res.json({
        label: classification, 
        aiSuggestion: aiSuggestion 
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
