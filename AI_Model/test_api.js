const http = require('http');

const data = JSON.stringify({
    text: "What is Ethernet?"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/predict',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Body:', body);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
