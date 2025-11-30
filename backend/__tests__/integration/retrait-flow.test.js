const request = require('supertest');
const app = require('../../server');
const Candidat = require('../../models/Candidat');
const Transaction = require('../../models/Transaction');
const mongoose = require('mongoose');

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Flux Retrait Financier', () => {
    let candidatId;

    beforeEach(async () => {
        // Créer un candidat avec du solde
        const candidat = new Candidat({
            nom: 'Rich',
            prenom: 'Boy',
            email: `rich${Date.now()}@test.com`,
            telephone: `077${Date.now().toString().slice(-6)}`,
            dateNaissance: new Date('2000-01-01'),
            nationalite: 'Gabonaise',
            nomEtablissement: 'UOB',
            categorie: 'Universitaire',
            soldeActuel: 50000, // 50.000 FCFA
            statutAdministratif: 'ADMISSIBLE'
        });
        await candidat.save();
        candidatId = candidat._id;
    });

    it('devrait traiter une demande de retrait valide', async () => {
        const montantRetrait = 10000;

        // 1. Demande de retrait
        const res = await request(app)
            .post('/api/transactions/retrait')
            .send({
                candidatId,
                montant: montantRetrait,
                methodeRetrait: 'AIRTEL_MONEY',
                numeroCompte: '077000000',
                nomBeneficiaire: 'Rich Boy'
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        // Vérifier débit immédiat (Correction C2)
        expect(res.body.nouveauSolde).toBe(40000); // 50k - 10k

        const transactionId = res.body.transaction._id;

        // Vérifier transaction en attente
        const transaction = await Transaction.findById(transactionId);
        expect(transaction.statut).toBe('EN_ATTENTE');
        expect(transaction.montant).toBe(montantRetrait);

        // Vérifier solde en base
        const candidat = await Candidat.findById(candidatId);
        expect(candidat.soldeActuel).toBe(40000);
    });

    it('devrait rejeter un retrait supérieur au solde', async () => {
        const res = await request(app)
            .post('/api/transactions/retrait')
            .send({
                candidatId,
                montant: 60000, // > 50k
                methodeRetrait: 'AIRTEL_MONEY'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Solde insuffisant');

        // Vérifier solde inchangé
        const candidat = await Candidat.findById(candidatId);
        expect(candidat.soldeActuel).toBe(50000);
    });
});
