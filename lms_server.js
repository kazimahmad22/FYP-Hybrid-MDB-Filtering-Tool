const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5501;
const BASE_DIR = path.join(__dirname, 'MDB Interface');

const server = http.createServer((req, res) => {
    let url = req.url === '/' ? '/index.html' : req.url;
    let filePath = path.join(BASE_DIR, url);
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
