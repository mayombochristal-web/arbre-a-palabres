const { soumettreCandidature } = require('../../utils/calculsFinanciers');

describe('Calculs Financiers - soumettreCandidature', () => {

    // Cas 1: Primaire
    test('devrait calculer correctement pour Primaire', () => {
        const data = {
            dateNaissance: new Date(new Date().getFullYear() - 10, 0, 1), // 10 ans
            nationalite: 'Gabonaise',
            nomEtablissement: 'Ecole A',
            fichiers: { carteEtudiant: 'path/to/file' }
        };

        const result = soumettreCandidature(data);

        expect(result.categorie).toBe('Primaire');
        expect(result.fraisInscription).toBe(500); // Correction: 500 FCFA selon calculsFinanciers.js
        expect(result.statutAdministratif).toBe('PAIEMENT_EN_ATTENTE'); // Correction: PAIEMENT_EN_ATTENTE
    });

    // Cas 2: Collège/Lycée
    test('devrait calculer correctement pour Collège/Lycée', () => {
        const data = {
            dateNaissance: new Date(new Date().getFullYear() - 15, 0, 1), // 15 ans
            nationalite: 'Gabonaise',
            nomEtablissement: 'Lycée B',
            fichiers: { carteEtudiant: 'path/to/file' }
        };

        const result = soumettreCandidature(data);

        expect(result.categorie).toBe('College/Lycee');
        expect(result.fraisInscription).toBe(1000); // Correction: 1000 FCFA
    });

    // Cas 3: Universitaire
    test('devrait calculer correctement pour Universitaire', () => {
        const data = {
            dateNaissance: new Date(new Date().getFullYear() - 20, 0, 1), // 20 ans
            nationalite: 'Gabonaise',
            nomEtablissement: 'Université C',
            fichiers: { carteEtudiant: 'path/to/file' }
        };

        const result = soumettreCandidature(data);

        expect(result.categorie).toBe('Universitaire');
        expect(result.fraisInscription).toBe(2000); // Correction: 2000 FCFA
    });

    // Cas 4: Âge invalide (trop jeune)
    test('devrait rejeter si trop jeune', () => {
        const data = {
            dateNaissance: new Date(new Date().getFullYear() - 5, 0, 1), // 5 ans
            nationalite: 'Gabonaise',
            nomEtablissement: 'Ecole A',
            fichiers: { carteEtudiant: 'path/to/file' }
        };

        expect(() => soumettreCandidature(data)).toThrow('Âge minimum requis non atteint');
    });

    // Cas 5: Âge invalide (trop vieux)
    test('devrait rejeter si trop vieux', () => {
        const data = {
            dateNaissance: new Date(new Date().getFullYear() - 45, 0, 1), // 45 ans
            nationalite: 'Gabonaise',
            nomEtablissement: 'Université C',
            fichiers: { carteEtudiant: 'path/to/file' }
        };

        expect(() => soumettreCandidature(data)).toThrow('Âge maximum dépassé');
    });

    // Cas 6: Données manquantes
    test('devrait rejeter si données manquantes', () => {
        expect(() => soumettreCandidature({})).toThrow();
    });
});
