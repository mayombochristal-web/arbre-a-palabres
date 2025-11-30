const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Candidat = require('./models/Candidat');

// Connexion à MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connecté\n');
    } catch (error) {
        console.error('❌ Erreur connexion MongoDB:', error);
        process.exit(1);
    }
};

// Fonction principale
const seedDatabase = async () => {
    try {
        console.log('🌱 Initialisation de la base de données...\n');

        await connectDB();

        // 1. Créer l'administrateur
        console.log('👤 Création de l\'administrateur...');

        // Admin par défaut
        const defaultAdminEmail = 'admin@arbre-palabres.ga';
        const existingDefaultAdmin = await User.findOne({ email: defaultAdminEmail });

        if (existingDefaultAdmin) {
            console.log('ℹ️  Administrateur par défaut existe déjà');
        } else {
            await User.create({
                nom: 'Admin',
                prenom: 'Principal',
                email: defaultAdminEmail,
                password: 'Admin123!',
                role: 'admin'
            });
            console.log('✅ Administrateur par défaut créé');
        }

        // Admin Spécifique (Demandé par le client)
        const specificAdminEmail = 'mayombochristal@gmail.com';
        const existingSpecificAdmin = await User.findOne({ email: specificAdminEmail });

        if (existingSpecificAdmin) {
            console.log('ℹ️  Administrateur spécifique existe déjà, mise à jour du rôle et mot de passe...');
            existingSpecificAdmin.role = 'admin';
            existingSpecificAdmin.password = 'Broozy040200'; // Sera hashé par le middleware pre-save
            await existingSpecificAdmin.save();
            console.log('✅ Administrateur spécifique mis à jour');
        } else {
            await User.create({
                nom: 'Mayombo',
                prenom: 'Christal',
                email: specificAdminEmail,
                password: 'Broozy040200',
                role: 'admin'
            });
            console.log('✅ Administrateur spécifique créé');
        }
        console.log('');

        // 2. Créer des candidats de test
        console.log('👥 Création des candidats...');
        await Candidat.deleteMany({});

        const candidats = await Candidat.insertMany([
            // Élèves Primaire
            {
                nom: 'Mbina',
                prenom: 'Grace',
                dateNaissance: new Date('2013-05-15'),
                nationalite: 'Gabonaise',
                email: 'grace.mbina@example.ga',
                telephone: '+24177001001',
                nomEtablissement: 'École Primaire Nkembo',
                categorie: 'Primaire',
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true,
                soldeActuel: 2000
            },
            {
                nom: 'Nguema',
                prenom: 'Axel',
                dateNaissance: new Date('2012-08-20'),
                nationalite: 'Gabonaise',
                email: 'axel.nguema@example.ga',
                telephone: '+24177001002',
                nomEtablissement: 'École Primaire Nkembo',
                categorie: 'Primaire',
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true,
                soldeActuel: 1500
            },
            // Élèves Collège/Lycée
            {
                nom: 'Obiang',
                prenom: 'Sarah',
                dateNaissance: new Date('2008-03-10'),
                nationalite: 'Gabonaise',
                email: 'sarah.obiang@example.ga',
                telephone: '+24177001003',
                nomEtablissement: 'Lycée Léon Mba',
                categorie: 'College/Lycee',
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true,
                soldeActuel: 3000
            },
            {
                nom: 'Ondo',
                prenom: 'Kevin',
                dateNaissance: new Date('2009-11-25'),
                nationalite: 'Gabonaise',
                email: 'kevin.ondo@example.ga',
                telephone: '+24177001004',
                nomEtablissement: 'Lycée Léon Mba',
                categorie: 'College/Lycee',
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true,
                soldeActuel: 2500
            },
            // Étudiants Universitaires
            {
                nom: 'Mboumba',
                prenom: 'Christelle',
                dateNaissance: new Date('2003-07-12'),
                nationalite: 'Gabonaise',
                email: 'christelle.mboumba@example.ga',
                telephone: '+24177001005',
                nomEtablissement: 'Université Omar Bongo',
                categorie: 'Universitaire',
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true,
                soldeActuel: 5000
            },
            {
                nom: 'Ndong',
                prenom: 'Junior',
                dateNaissance: new Date('2004-01-30'),
                nationalite: 'Gabonaise',
                email: 'junior.ndong@example.ga',
                telephone: '+24177001006',
                nomEtablissement: 'Université Omar Bongo',
                categorie: 'Universitaire',
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true,
                soldeActuel: 4500
            },
            {
                nom: 'Ella',
                prenom: 'Divine',
                dateNaissance: new Date('2003-09-18'),
                nationalite: 'Gabonaise',
                email: 'divine.ella@example.ga',
                telephone: '+24177001007',
                nomEtablissement: 'Université Omar Bongo',
                categorie: 'Universitaire',
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true,
                soldeActuel: 3500
            },
            {
                nom: 'Koumba',
                prenom: 'Steeve',
                dateNaissance: new Date('2004-06-05'),
                nationalite: 'Gabonaise',
                email: 'steeve.koumba@example.ga',
                telephone: '+24177001008',
                nomEtablissement: 'Université Omar Bongo',
                categorie: 'Universitaire',
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true,
                soldeActuel: 4000
            }
        ]);

        console.log(`✅ ${candidats.length} candidats créés\n`);

        console.log('🎉 Base de données initialisée avec succès!\n');
        console.log('═══════════════════════════════════════════');
        console.log('📊 RÉSUMÉ');
        console.log('═══════════════════════════════════════════');
        console.log(`✓ 1 administrateur`);
        console.log(`✓ ${candidats.length} candidats`);
        console.log('');
        console.log('🔑 CONNEXION ADMINISTRATEUR');
        console.log('═══════════════════════════════════════════');
        console.log('Email:        admin@arbre-palabres.ga');
        console.log('Mot de passe: Admin123!');
        console.log('');
        console.log('👥 CANDIDATS CRÉÉS');
        console.log('═══════════════════════════════════════════');
        candidats.forEach((c, i) => {
            console.log(`${i + 1}. ${c.prenom} ${c.nom} (${c.categorie}) - Solde: ${c.soldeActuel} FCFA`);
        });
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du seed:', error);
        process.exit(1);
    }
};

// Exécuter le seed
seedDatabase();
