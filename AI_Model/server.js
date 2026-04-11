const express = require('express');
const cors = require('cors');
const natural = require('natural');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const MODEL_PATH = path.join(__dirname, 'model.json');

let classifier = null;

natural.BayesClassifier.load(MODEL_PATH, null, function(err, loadedClassifier) {
    if (err) {
        console.error('Failed to load model. Ensure you have run train_model.js first.', err);
    } else {
        classifier = loadedClassifier;
        console.log('Model successfully loaded into memory.');
    }
});

app.post('/predict', (req, res) => {
    if (!classifier) {
        return res.status(503).json({ error: 'Model not loaded yet or failed to load. Please train the model.' });
    }

    const text = req.body.text;
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Please provide valid text for prediction.' });
    }

    // Get the category classification
    const classification = classifier.classify(text);
    
    // To get raw scores/probabilities, we can use getClassifications
    const classifications = classifier.getClassifications(text);
    
    res.json({
        label: classification, // 'academic' or 'non-academic'
        classifications: classifications // e.g., [{label: 'academic', value: 0.8}, {label: 'non-academic', value: 0.2}]
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
