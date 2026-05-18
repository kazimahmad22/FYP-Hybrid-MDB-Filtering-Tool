const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5501;
const BASE_DIR = path.join(__dirname, 'MDB Interface');
const QUERIES_FILE = path.join(BASE_DIR, 'queries.json');

function readQueries() {
    try {
        if (fs.existsSync(QUERIES_FILE)) {
            const data = fs.readFileSync(QUERIES_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {}
    return [];
}

function writeQueries(queries) {
    fs.writeFileSync(QUERIES_FILE, JSON.stringify(queries, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
    // CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let url = req.url;

    // --- API Routes ---
    if (url.startsWith('/api/queries')) {
        res.setHeader('Content-Type', 'application/json');

        // GET /api/queries - Return all queries
        if (req.method === 'GET' && url === '/api/queries') {
            const queries = readQueries();
            res.writeHead(200);
            res.end(JSON.stringify(queries));
            return;
        }

        // POST /api/queries - Add new query
        if (req.method === 'POST' && url === '/api/queries') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const newQuery = JSON.parse(body);
                    const queries = readQueries();

                    // Check if query already exists (by id)
                    const exists = queries.some(q => q.id === newQuery.id);
                    if (!exists) {
                        queries.unshift(newQuery);
                        writeQueries(queries);
                    }

                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true }));
                } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }

        // DELETE /api/queries/:id - Delete a query
        const deleteMatch = url.match(/^\/api\/queries\/(\d+)$/);
        if (req.method === 'DELETE' && deleteMatch) {
            const queryId = parseInt(deleteMatch[1]);
            console.log(`Server: Received delete request for query ID: ${queryId}`);
            
            const queries = readQueries();
            const initialCount = queries.length;
            const newQueries = queries.filter(q => q.id !== queryId);
            
            if (initialCount !== newQueries.length) {
                writeQueries(newQueries);
                console.log(`Server: Successfully deleted query ID: ${queryId}. Remaining: ${newQueries.length}`);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, deletedId: queryId }));
            } else {
                console.warn(`Server: Query ID ${queryId} not found for deletion.`);
                res.writeHead(404);
                res.end(JSON.stringify({ error: `Query with ID ${queryId} not found` }));
            }
            return;
        }

        // POST /api/queries/:id/reply - Reply to a query
        const replyMatch = url.match(/^\/api\/queries\/(\d+)\/reply$/);
        if (req.method === 'POST' && replyMatch) {
            const queryId = parseInt(replyMatch[1]);
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const { reply } = JSON.parse(body);
                    const queries = readQueries();

                    const idx = queries.findIndex(q => q.id === queryId);
                    if (idx !== -1) {
                        queries[idx].status = 'replied';
                        // Support multiple replies
                        if (!queries[idx].replies) {
                            queries[idx].replies = [];
                        }
                        // Migrate old single reply if it exists
                        if (queries[idx].reply && queries[idx].replies.length === 0) {
                            queries[idx].replies.push(queries[idx].reply);
                        }
                        
                        const replyObj = {
                            text: reply,
                            timestamp: new Date().toISOString()
                        };
                        
                        queries[idx].replies.push(replyObj);
                        // Keep legacy field updated with the latest text for simple views
                        queries[idx].reply = reply; 
                        
                        writeQueries(queries);
                    }

                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true }));
                } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }
    }

    // --- Static File Serving ---
    let fileUrl = url === '/' ? '/index.html' : url;
    let filePath = path.join(BASE_DIR, fileUrl);
    let extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 File Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`LMS Server running at http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to stop the server.`);
});