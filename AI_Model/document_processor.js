const pdf = require('pdf-parse');
const natural = require('natural');
const TfIdf = natural.TfIdf;

class DocumentProcessor {
    constructor() {
        this.tfidf = new TfIdf();
        this.chunks = []; // Stores the original text chunks for retrieval
        this.isReady = false;
    }

    /**
     * Extracts text from a PDF buffer and chunks it for indexing.
     */
    async processPDF(buffer) {
        try {
            const data = await pdf(buffer);
            const fullText = data.text;
            
            // Chunking: Split text by paragraphs or sentences. 
            // For simple RAG, we'll split by double newlines or roughly 500 characters.
            this.chunks = fullText.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 50);
            
            // Index the chunks
            this.tfidf = new TfIdf();
            this.chunks.forEach((chunk, index) => {
                this.tfidf.addDocument(chunk);
            });

            this.isReady = true;
            console.log(`Document processed: ${this.chunks.length} chunks indexed.`);
            return { success: true, chunkCount: this.chunks.length };
        } catch (error) {
            console.error('Error processing PDF:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Searches for relevant context based on a natural language query.
     */
    findContext(query, topK = 2) {
        if (!this.isReady || this.chunks.length === 0) return null;

        const results = [];
        this.tfidf.tfidfs(query, (i, measure) => {
            results.push({ index: i, score: measure, text: this.chunks[i] });
        });

        // Sort by score and take topK
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .filter(res => res.score > 0)
            .map(res => res.text)
            .join('\n---\n');
    }
}

module.exports = new DocumentProcessor();
