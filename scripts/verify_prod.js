const https = require('https');

const BASE_URL = 'https://arbre-a-palabres-backend.onrender.com';

const endpoints = [
    { path: '/sante', method: 'GET', name: 'Santé (Legacy)' },
    { path: '/api/health', method: 'GET', name: 'Health Check (New)' },
    { path: '/', method: 'GET', name: 'Root Info' },
    { path: '/api/debats', method: 'GET', name: 'Liste Débats' },
    { path: '/api/test-email', method: 'GET', name: 'Test Email' },
    { path: '/api/formations', method: 'GET', name: 'Formations (Empty)' },
    // Auth check (should fail 401 or 404 if route missing)
    { path: '/api/auth/me', method: 'GET', name: 'Auth Profile (Expect 401)' }
];

console.log(`🔍 Démarrage de la vérification sur ${BASE_URL}\n`);

const checkEndpoint = (endpoint) => {
    return new Promise((resolve) => {
        const req = https.request(`${BASE_URL}${endpoint.path}`, { method: endpoint.method }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const statusIcon = res.statusCode >= 200 && res.statusCode < 300 ? '✅' :
                    (endpoint.name.includes('Expect 401') && res.statusCode === 401) ? '✅' :
                        '❌';

                console.log(`${statusIcon} ${endpoint.name} (${endpoint.path})`);
                console.log(`   Status: ${res.statusCode}`);
                if (res.statusCode !== 200 && !endpoint.name.includes('Expect')) {
                    console.log(`   Response: ${data.substring(0, 100)}...`);
                }
                console.log('---');
                resolve({ path: endpoint.path, status: res.statusCode });
            });
        });

        req.on('error', (e) => {
            console.log(`❌ ${endpoint.name} (${endpoint.path}) - Error: ${e.message}`);
            resolve({ path: endpoint.path, status: 'ERROR' });
        });

        req.end();
    });
};

(async () => {
    for (const endpoint of endpoints) {
        await checkEndpoint(endpoint);
    }
})();
