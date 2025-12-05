const https = require('https');

const urls = [
    'https://arbre-a-palabre-9e83a.web.app',
    'https://arbre-palabres-backend.onrender.com/health',
    'https://arbre-palabres-backend.onrender.com/sante'
];

urls.forEach(url => {
    https.get(url, (res) => {
        console.log(`URL: ${url} - Status: ${res.statusCode}`);
        if (res.statusCode !== 200) {
            console.log('❌ DOWN or ERROR');
        } else {
            console.log('✅ UP');
        }
    }).on('error', (e) => {
        console.error(`URL: ${url} - Error: ${e.message}`);
    });
});
