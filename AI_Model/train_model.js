const fs = require('fs');
const path = require('path');
const natural = require('natural');
const csv = require('csv-parser');

const classifier = new natural.BayesClassifier();
const DATASET_PATH = path.join(__dirname, '..', 'Dataset', 'labeled_messages.csv');
const MODEL_PATH = path.join(__dirname, 'model.json');

console.log('Loading dataset from:', DATASET_PATH);

const trainingData = [];

fs.createReadStream(DATASET_PATH)
    .pipe(csv())
    .on('data', (row) => {
        // row.message_content, row.label
        if (row.message_content && row.label) {
            // Label 0 is "academic", Label 1 is "non-academic"
            const category = row.label === '0' ? 'academic' : 'non-academic';
            classifier.addDocument(row.message_content, category);
            trainingData.push(row);
        }
    })
    .on('end', () => {
        console.log(`Loaded ${trainingData.length} messages for training.`);
        console.log('Training model...');
        classifier.train();
        
        console.log('Saving model to:', MODEL_PATH);
        classifier.save(MODEL_PATH, function(err, classifier) {
            if (err) {
                console.error('Error saving model:', err);
            } else {
                console.log('Model successfully trained and saved!');
            }
        });
    })
    .on('error', (error) => {
        console.error('Error reading CSV:', error);
    });
