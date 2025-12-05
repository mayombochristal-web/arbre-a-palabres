const https = require('https');

const checkUrl = (url) => {
    return new Promise((resolve) => {
        console.log(`Checking ${url}...`);
        https.get(url, (res) => {
            console.log(`${url} responded with Status: ${res.statusCode}`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Body length: ${data.length}`);
                resolve(res.statusCode);
            });
        }).on('error', (e) => {
            console.error(`Error checking ${url}: ${e.message}`);
            resolve(0);
        });
    });
};

const run = async () => {
    await checkUrl('https://arbre-a-palabre-9e83a.web.app');
    await checkUrl('https://arbre-palabres-backend.onrender.com/health');
};

run();
