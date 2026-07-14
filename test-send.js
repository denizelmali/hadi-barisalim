const http = require('http');

const data = JSON.stringify({
  recipientName: "Test Arkadaş",
  recipientEmail: "test-ipp24483k@srv1.mail-tester.com",
  tone: "duygusal",
  mode: "anonymous"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log(`statusCode: ${res.statusCode}`);
    console.log(`body: ${body}`);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
