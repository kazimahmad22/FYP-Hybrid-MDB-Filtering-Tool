const natural = require('natural');
const path = require('path');
const docProcessor = require('./document_processor');

const MODEL_PATH = path.join(__dirname, 'model.json');

async function verify() {
    console.log("Loading model...");
    natural.BayesClassifier.load(MODEL_PATH, null, async function(err, classifier) {
        if (err) {
            console.error("Failed to load model:", err);
            return;
        }

        // Wait for docProcessor to be ready
        console.log("Waiting for RAG engine...");
        while (!docProcessor.isReady) {
            await new Promise(r => setTimeout(r, 500));
        }

        const detectExcessiveRepetition = (str) => /(.)\1{2,}/.test(str);

        async function predict(text) {
            // 0. Heuristics
            if (detectExcessiveRepetition(text)) {
                return { label: 'non-academic', reason: 'repetition' };
            }

            // 1. Bayes
            let classification = classifier.classify(text);

            // 2. Strict Matching
            let aiSuggestion = await docProcessor.findContext(text);
            if (classification === 'academic' && !aiSuggestion) {
                classification = 'non-academic';
                return { label: classification, reason: 'strict-matching' };
            }

            return { label: classification, reason: aiSuggestion ? 'rag-match' : 'bayes' };
        }

        const tests = [
            "thaaaank you",
            "helloooooo",
            "What is the capital of France?",
            "What is ARP?",
            "How do devices avoid packet collisions?",
            "good lecture sir",
            "AOA"
        ];

        console.log("\n--- Advanced Detection Results ---");
        for (const t of tests) {
            const res = await predict(t);
            console.log(`Query: "${t}" -> Label: ${res.label} (${res.reason})`);
        }
    });
}

verify();
