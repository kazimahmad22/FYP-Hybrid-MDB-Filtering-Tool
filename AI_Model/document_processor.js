const fs = require('fs');
const path = require('path');
const { pipeline } = require('@xenova/transformers');
const bm25 = require('wink-bm25-text-search');
const nlp = require('wink-nlp-utils');

class DocumentProcessor {
    constructor() {
        this.qaPairs = [];
        this.isReady = false;
        this.extractor = null;
        this.engine = bm25();
        
        // Configuration from "New Approach" (Tightened per user request)
        this.weights = { semantic: 0.7, bm25: 0.3 };
        this.thresholds = { high: 0.75, medium: 0.60, ambiguous: 0.45 };
        
        // ... abbreviations same ...
        this.abbreviations = {
// ...
            "arp": "address resolution protocol",
            "tcp": "transmission control protocol",
            "udp": "user datagram protocol",
            "ip": "internet protocol",
            "mac": "media access control",
            "lan": "local area network",
            "wan": "wide area network",
            "csma": "carrier sense multiple access",
            "cd": "collision detection",
            "ca": "collision avoidance"
        };
        
        this.loadHandout();
    }

    async loadHandout() {
        try {
            console.log("[RAG] Initializing Semantic Model (all-MiniLM-L6-v2)...");
            // Load embedding model
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

            const filePath = path.join(__dirname, '..', 'Dataset', 'CS610_Handout.json');
            if (!fs.existsSync(filePath)) {
                console.error("[RAG] Handout file not found!");
                return;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            this.qaPairs = JSON.parse(content);

            // 1. Prepare BM25
            this.engine.defineConfig({ fldWeights: { question: 1, keywords: 0.8, aliases: 0.6 } });
            this.engine.definePrepTasks([
                nlp.string.lowerCase,
                nlp.string.removePunctuations,
                nlp.string.tokenize0,
                nlp.tokens.removeWords,
                nlp.tokens.stem
            ]);

            // 2. Pre-compute embeddings and Index BM25
            console.log(`[RAG] Encoding ${this.qaPairs.length} knowledge entries...`);
            for (let i = 0; i < this.qaPairs.length; i++) {
                const item = this.qaPairs[i];
                
                // BM25 Indexing
                this.engine.addDoc({
                    question: item.normalized_question,
                    keywords: (item.keywords || []).join(' '),
                    aliases: (item.aliases || []).join(' ')
                }, item.id);

                // Semantic Indexing (Question)
                const output = await this.extractor(item.question, { pooling: 'mean', normalize: true });
                item.embedding = Array.from(output.data);

                // Semantic Indexing (Aliases)
                item.aliasEmbeddings = [];
                for (const alias of (item.aliases || [])) {
                    const aliasOutput = await this.extractor(alias, { pooling: 'mean', normalize: true });
                    item.aliasEmbeddings.push(Array.from(aliasOutput.data));
                }
            }

            this.engine.consolidate();
            this.isReady = true;
            console.log(`[RAG] Ready! Hybrid Engine Online (${this.qaPairs.length} entries).`);
        } catch (error) {
            console.error("[RAG] Initialization failed:", error);
        }
    }

    preprocess(query) {
        let normalized = query.toLowerCase();
        
        // Strip punctuation (keep hyphens internally)
        normalized = normalized.replace(/[^\w\s-]/g, ' ');
        
        // Remove Fillers
        const fillers = [
            "what is", "what are", "what does", "what do",
            "explain", "describe", "define", "tell me about",
            "how does", "how do", "how is", "can you",
            "i want to know", "i need to understand", "please tell me"
        ];
        fillers.forEach(f => {
            normalized = normalized.replace(new RegExp(`\\b${f}\\b`, 'g'), '');
        });

        // Abbreviation Expansion
        let tokens = normalized.split(/\s+/);
        tokens = tokens.map(t => this.abbreviations[t] || t);
        
        return tokens.join(' ').trim().replace(/\s+/g, ' ');
    }

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async findContext(query) {
        if (!this.isReady) return null;

        const normalizedQuery = this.preprocess(query);
        if (!normalizedQuery && !query) return null;

        // SIGNAL A: Semantic Similarity (USE RAW QUERY for better context)
        const queryOutput = await this.extractor(query, { pooling: 'mean', normalize: true });
        const queryEmbedding = Array.from(queryOutput.data);

        // SIGNAL B: BM25 (USE NORMALIZED for keywords)
        const searchQuery = normalizedQuery || query;
        const bm25Results = this.engine.search(searchQuery, 10);
        const bm25Map = {};
        bm25Results.forEach(res => {
            bm25Map[res[0]] = res[1]; // score is res[1]
        });

        // Normalize BM25 scores (Wink scores can be > 1, so we normalize the top score to 1)
        const maxBM25 = bm25Results.length > 0 ? bm25Results[0][1] : 1;

        // Combine Scores
        const candidates = this.qaPairs.map(item => {
            // Semantic Score (Max of question or its aliases)
            let semanticScore = this.cosineSimilarity(queryEmbedding, item.embedding);
            item.aliasEmbeddings.forEach(ae => {
                const s = this.cosineSimilarity(queryEmbedding, ae);
                if (s > semanticScore) semanticScore = s;
            });

            // BM25 Score (Normalized)
            const rawBM25 = bm25Map[item.id] || 0;
            const normBM25 = rawBM25 / (maxBM25 || 1);

            const finalScore = (this.weights.semantic * semanticScore) + (this.weights.bm25 * normBM25);

            if (finalScore > 0.3) {
                console.log(`[RAG] Candidate: "${item.question.substring(0, 30)}..." | S: ${semanticScore.toFixed(2)} | B: ${normBM25.toFixed(2)} | F: ${finalScore.toFixed(2)}`);
            }

            return { ...item, finalScore };
        });

        candidates.sort((a, b) => b.finalScore - a.finalScore);

        const top = candidates[0];
        const second = candidates[1] || { finalScore: 0 };
        const gap = top.finalScore - second.finalScore;

        // EXTRA SECURITY: If the top semantic score is extremely low, it's a hallucination
        // We calculate the top candidate's semantic contribution
        const topSemantic = candidates[0].finalScore; // already weighted
        if (top.finalScore < 0.50) {
            return null; // Return null to stay silent on low confidence
        }

        console.log(`[RAG] Top Match: "${top.question}" | Score: ${top.finalScore.toFixed(3)} | Gap: ${gap.toFixed(3)}`);

        // Gating Logic
        if (top.finalScore >= this.thresholds.high && gap >= 0.10) {
            return top.answer;
        } 
        
        if (top.finalScore >= this.thresholds.medium && gap >= 0.08) {
            return `Based on your question, here is what the course material covers: \n\n${top.answer}\n\n*If this doesn't match, try rephrasing or check with your instructor.*`;
        }

        if (top.finalScore >= this.thresholds.ambiguous && gap < 0.08) {
            const options = candidates.slice(0, 2).map((c, i) => `${i+1}. **${c.question}**`).join('\n');
            return `Your question could relate to these topics:\n${options}\n\nWhich one were you asking about?`;
        }

        return null; // Silent if no clear match meets thresholds
    }
}

module.exports = new DocumentProcessor();
