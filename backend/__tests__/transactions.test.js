const request = require('supertest');
const app = require('../server');

describe('Transactions API', () => {
    describe('POST /api/transactions/retrait', () => {
        it('devrait rejeter une demande sans données', async () => {
            const res = await request(app)
                .post('/api/transactions/retrait')
                .send({})
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.error).toBeDefined();
        });

        it('devrait rejeter un montant négatif', async () => {
            const res = await request(app)
                .post('/api/transactions/retrait')
                .send({
                    candidatId: '507f1f77bcf86cd799439011',
                    montant: -100,
                    methodeRetrait: 'AIRTEL_MONEY',
                    numeroCompte: '+241 XX XX XX XX',
                    nomBeneficiaire: 'Test User'
                })
                .expect(400);

            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/transactions/candidat/:candidatId', () => {
        it('devrait retourner les transactions d\'un candidat', async () => {
            const candidatId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .get(`/api/transactions/candidat/${candidatId}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('transactions');
            expect(Array.isArray(res.body.transactions)).toBe(true);
        });

        it('devrait supporter le filtrage par type', async () => {
            const candidatId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .get(`/api/transactions/candidat/${candidatId}?type=RETRAIT`)
                .expect(200);

            expect(res.body.success).toBe(true);
        });
    });
});
