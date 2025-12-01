const request = require('supertest');
const app = require('../server');

describe('Candidats API', () => {
    describe('GET /api/candidats/classement/:categorie', () => {
        it('devrait retourner le classement pour la catégorie Primaire', async () => {
            const res = await request(app)
                .get('/api/candidats/classement/Primaire')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('categorie', 'Primaire');
            expect(res.body).toHaveProperty('classement');
            expect(Array.isArray(res.body.classement)).toBe(true);
        });

        it('devrait retourner le classement pour College/Lycee', async () => {
            const res = await request(app)
                .get('/api/candidats/classement/College%2FLycee')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.categorie).toBe('College/Lycee');
        });

        it('devrait rejeter une catégorie invalide', async () => {
            const res = await request(app)
                .get('/api/candidats/classement/InvalidCategory')
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('invalide');
        });

        it('devrait supporter la pagination', async () => {
            const res = await request(app)
                .get('/api/candidats/classement/Primaire?page=1&limit=10')
                .expect(200);

            expect(res.body).toHaveProperty('page', 1);
            expect(res.body).toHaveProperty('limit', 10);
            expect(res.body).toHaveProperty('totalPages');
        });
    });

    describe('GET /api/candidats', () => {
        it('devrait retourner la liste des candidats', async () => {
            const res = await request(app)
                .get('/api/candidats')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('candidats');
            expect(Array.isArray(res.body.candidats)).toBe(true);
        });

        it('devrait supporter la recherche', async () => {
            const res = await request(app)
                .get('/api/candidats?search=test')
                .expect(200);

            expect(res.body.success).toBe(true);
        });
    });
});
