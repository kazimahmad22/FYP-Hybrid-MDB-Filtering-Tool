const { pipeline, env } = require('@xenova/transformers');
const path = require('path');

// Configure environment
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.cacheDir = path.join(__dirname, '.cache');

async function download() {
    console.log("--------------------------------------------------");
    console.log("Hybrid MDB Filtering Tool - Model Downloader");
    console.log("--------------------------------------------------");
    console.log("Target Directory:", env.cacheDir);
    console.log("Downloading 'Xenova/all-MiniLM-L6-v2'...");
    
    try {
        await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log("\nSuccess! Model is now cached locally.");
        console.log("You can now run 'node server.js' safely.");
    } catch (err) {
        console.error("\nDownload failed!");
        if (err.message.includes('429')) {
            console.error("Error 429: Hugging Face is rate-limiting your connection.");
            console.error("Please wait 5-10 minutes and try again.");
        } else {
            console.error("Error details:", err.message);
        }
        process.exit(1);
    }
}

download();
