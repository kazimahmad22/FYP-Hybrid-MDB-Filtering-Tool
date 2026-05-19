const { pipeline } = require('@xenova/transformers');

async function test() {
    console.log("Loading model...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
    const text = "What is CS610?";
    console.log(`Processing: "${text}"`);
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    console.log('Output keys:', Object.keys(output));
    console.log('Output data length:', output.data.length);
    if (output.dims) console.log('Output dims:', output.dims);
}

test();
