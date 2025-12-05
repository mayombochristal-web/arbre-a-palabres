const Debat = require('../models/Debat');
const Candidat = require('../models/Candidat');
const Transaction = require('../models/Transaction');
const { organiserNouveauDebatSimple, creerDebatDefi } = require('../utils/calculsFinanciers');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../config/logger');

class DebatController {

    /**
     * @desc    Créer un débat standard
     * @route   POST /api/debats/standard
     */
    async createStandard(req, res) {
        try {
            const { participantsIds, theme } = req.body;

            const participants = await Candidat.find({
                _id: { $in: participantsIds },
                statutAdministratif: 'ADMISSIBLE',
                fraisInscriptionPayes: true
            });

            if (participants.length !== 4) {
                return res.status(400).json(ApiResponse.error('4 participants admissibles avec frais payés requis'));
            }

            const categorie = participants[0].categorie;
            if (!participants.every(p => p.categorie === categorie)) {
                return res.status(400).json(ApiResponse.error('Tous les participants doivent être de la même catégorie'));
            }

            const debatData = organiserNouveauDebatSimple(participants, theme);
            debatData.juge_id = req.user._id;

            const nouveauDebat = new Debat(debatData);
            await nouveauDebat.save();

            const debatComplet = await Debat.findById(nouveauDebat._id)
                .populate('participants_ids', 'nom prenom categorie soldeActuel scoreFinal');

            res.status(201).json(ApiResponse.success({
                debat: debatComplet,
                repartition: {
                    cagnotteTotale: debatData.cagnotte_totale,
                    fraisOrganisation: debatData.frais_organisation,
                    gainVainqueur: debatData.gain_vainqueur,
                    tauxFrais: '25%',
                    tauxGain: '75%',
                    fraisUnitaire: debatData.frais_unitaire
                }
            }, 'Débat créé avec succès avec répartition 25%/75%'));

        } catch (error) {
            logger.error('Erreur création débat:', error);
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * @desc    Créer un débat de défi
     * @route   POST /api/debats/defi
     */
    async createDefi(req, res) {
        try {
            const { participantsIds, miseUnitaire, theme } = req.body;

            const participants = await Candidat.find({
                _id: { $in: participantsIds },
                statutAdministratif: 'ADMISSIBLE'
            });

            if (participants.length !== 4) {
                return res.status(400).json(ApiResponse.error('4 participants requis pour un défi'));
            }

            const participantsInsuffisants = participants.filter(
                p => p.soldeActuel < miseUnitaire
            );

            if (participantsInsuffisants.length > 0) {
                return res.status(400).json(ApiResponse.error('Certains participants ont un solde insuffisant', {
                    participantsInsuffisants: participantsInsuffisants.map(p => ({
                        id: p._id,
                        nom: `${p.prenom} ${p.nom}`,
                        solde: p.soldeActuel,
                        miseRequise: miseUnitaire
                    }))
                }));
            }

            const debatData = creerDebatDefi(participants, miseUnitaire, theme);

            const transactions = [];
            for (const participant of participants) {
                participant.soldeActuel -= miseUnitaire;
                await participant.save();

                const transaction = new Transaction({
                    candidat_id: participant._id,
                    type: 'FRAIS_INSCRIPTION',
                    montant: miseUnitaire,
                    description: `Mise pour le défi: ${theme}`,
                    statut: 'VALIDEE',
                    debat_id: null
                });
                await transaction.save();
                transactions.push(transaction);
            }

            const nouveauDebat = new Debat(debatData);
            await nouveauDebat.save();

            for (const transaction of transactions) {
                transaction.debat_id = nouveauDebat._id;
                await transaction.save();
            }

            const debatComplet = await Debat.findById(nouveauDebat._id)
                .populate('participants_ids', 'nom prenom categorie soldeActuel');

            res.status(201).json(ApiResponse.success({
                debat: debatComplet,
                cagnotte: {
                    total: debatData.cagnotte_totale,
                    gainVainqueur: debatData.gain_vainqueur,
                    fraisOrganisation: debatData.frais_organisation
                }
            }, 'Défi créé avec succès'));

        } catch (error) {
            logger.error('Erreur création défi:', error);
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    /**
     * @desc    Obtenir les défis disponibles
     * @route   GET /api/debats/defis/disponibles
     */
    async getAvailableChallenges(req, res) {
        try {
            const defis = await Debat.find({
                type_debat: 'defi',
                statut: 'en_attente'
            })
                .populate('participants_ids', 'nom prenom categorie')
                .sort({ createdAt: -1 });

            res.status(200).json(ApiResponse.success(defis));

        } catch (error) {
            logger.error('Erreur récupération défis:', error);
            res.status(500).json(ApiResponse.error('Erreur lors de la récupération des défis'));
        }
    }

    /**
     * @desc    Obtenir tous les débats
     * @route   GET /api/debats
     */
    async getAll(req, res) {
        try {
            const {
                statut,
                type,
                categorie,
                page = 1,
                limit = 10
            } = req.query;

            const query = {};
            if (statut) query.statut = statut;
            if (type) query.type_debat = type;
            if (categorie) query.categorie = categorie;

            const debats = await Debat.find(query)
                .populate('participants_ids', 'nom prenom categorie scoreFinal')
                .populate('scores_participants.candidat_id', 'nom prenom')
                .populate('trophee_en_jeu', 'nom description')
                .sort({ date_debut: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Debat.countDocuments(query);

            res.status(200).json(ApiResponse.success({
                debats,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }));

        } catch (error) {
            logger.error('Erreur récupération débats:', error);
            res.status(500).json(ApiResponse.error('Erreur lors de la récupération des débats'));
        }
    }

    /**
     * @desc    Obtenir un débat spécifique
     * @route   GET /api/debats/:id
     */
    async getById(req, res) {
        try {
            const debat = await Debat.findById(req.params.id)
                .populate('participants_ids')
                .populate('trophee_en_jeu')
                .populate('scores_participants.candidat_id', 'nom prenom');

            if (!debat) {
                return res.status(404).json(ApiResponse.error('Débat non trouvé'));
            }

            res.status(200).json(ApiResponse.success(debat));

        } catch (error) {
            logger.error('Erreur récupération débat:', error);
            res.status(500).json(ApiResponse.error('Erreur lors de la récupération du débat'));
        }
    }

    /**
     * @desc    Clôturer un débat
     * @route   PATCH /api/debats/:id/cloturer
     */
    async closeDebate(req, res) {
        try {
            const { vainqueurId } = req.body;

            const debat = await Debat.findById(req.params.id)
                .populate('participants_ids');

            if (!debat) return res.status(404).json(ApiResponse.error('Débat non trouvé'));

            if (debat.statut !== 'en_cours') {
                return res.status(400).json(ApiResponse.error('Débat déjà terminé ou non commencé'));
            }

            const vainqueur = debat.participants_ids.find(p => p._id.toString() === vainqueurId);
            if (!vainqueur) {
                return res.status(400).json(ApiResponse.error('Le vainqueur doit être un participant du débat'));
            }

            vainqueur.soldeActuel += debat.gain_vainqueur;
            vainqueur.nombreVictoires += 1;

            const transactionGain = new Transaction({
                candidat_id: vainqueurId,
                type: 'GAIN_DEBAT',
                montant: debat.gain_vainqueur,
                description: `Gain du débat: ${debat.theme_debat}`,
                statut: 'VALIDEE',
                debat_id: debat._id,
                created_by: req.user._id
            });

            await transactionGain.save();

            const perdants = debat.participants_ids.filter(p => p._id.toString() !== vainqueurId);
            for (const perdant of perdants) {
                perdant.nombreDefaites += 1;
                await perdant.save();
            }

            debat.statut = 'termine';
            debat.date_fin = new Date();

            await Promise.all([
                debat.save(),
                vainqueur.save()
            ]);

            const debatMisAJour = await Debat.findById(req.params.id)
                .populate('participants_ids', 'nom prenom soldeActuel')
                .populate('scores_participants.candidat_id', 'nom prenom');

            res.status(200).json(ApiResponse.success({
                debat: debatMisAJour,
                gainDistribue: debat.gain_vainqueur,
                transaction: {
                    reference: transactionGain.reference,
                    montant: transactionGain.montant
                }
            }, `Débat clôturé. ${debat.gain_vainqueur} FCFA attribués au vainqueur.`));

        } catch (error) {
            logger.error('Erreur clôture débat:', error);
            res.status(500).json(ApiResponse.error('Erreur lors de la clôture du débat'));
        }
    }

    /**
     * @desc    Démarrer un débat
     * @route   PATCH /api/debats/:id/demarrer
     */
    async startDebate(req, res) {
        try {
            const debat = await Debat.findById(req.params.id);

            if (!debat) return res.status(404).json(ApiResponse.error('Débat non trouvé'));

            if (debat.statut !== 'en_attente') {
                return res.status(400).json(ApiResponse.error('Le débat ne peut pas être démarré dans son état actuel'));
            }

            debat.statut = 'en_cours';
            debat.date_debut = new Date();

            await debat.save();

            res.status(200).json(ApiResponse.success(debat, 'Débat démarré avec succès'));

        } catch (error) {
            logger.error('Erreur démarrage débat:', error);
            res.status(500).json(ApiResponse.error('Erreur lors du démarrage du débat'));
        }
    }

    /**
     * @desc    Mettre à jour les scores
     * @route   PATCH /api/debats/:id/scores
     */
    async updateScores(req, res) {
        try {
            const { scores } = req.body;
            const debat = await Debat.findById(req.params.id);

            if (!debat) return res.status(404).json(ApiResponse.error('Débat non trouvé'));

            if (debat.statut !== 'en_cours') {
                return res.status(400).json(ApiResponse.error('Le débat doit être en cours pour mettre à jour les scores'));
            }

            for (const score of scores) {
                if (!score.candidat_id || score.score_final === undefined) {
                    return res.status(400).json(ApiResponse.error('Chaque score doit avoir un candidat_id et un score_final'));
                }
                if (score.score_final < 0 || score.score_final > 20) {
                    return res.status(400).json(ApiResponse.error('Les scores doivent être entre 0 et 20'));
                }
            }

            debat.scores_participants = scores;
            await debat.save();

            for (const score of scores) {
                await Candidat.findByIdAndUpdate(score.candidat_id, {
                    scoreFinal: score.score_final
                });
            }

            res.status(200).json(ApiResponse.success({ scores: debat.scores_participants }, 'Scores mis à jour avec succès'));

        } catch (error) {
            logger.error('Erreur mise à jour scores:', error);
            res.status(500).json(ApiResponse.error('Erreur lors de la mise à jour des scores'));
        }
    }

    /**
     * @desc    Obtenir les statistiques
     * @route   GET /api/debats/statistiques/general
     */
    async getStats(req, res) {
        try {
            const totalDebats = await Debat.countDocuments();
            const debatsTermines = await Debat.countDocuments({ statut: 'termine' });
            const debatsEnCours = await Debat.countDocuments({ statut: 'en_cours' });

            const gainsTotaux = await Debat.aggregate([
                { $match: { statut: 'termine' } },
                { $group: { _id: null, total: { $sum: '$gain_vainqueur' } } }
            ]);

            const fraisTotaux = await Debat.aggregate([
                { $match: { statut: 'termine' } },
                { $group: { _id: null, total: { $sum: '$frais_organisation' } } }
            ]);

            const debatsParCategorie = await Debat.aggregate([
                { $group: { _id: '$categorie', count: { $sum: 1 } } }
            ]);

            let participantsEleves = 0;
            let participantsEtudiants = 0;
            let fondsIncubation = 0;

            debatsParCategorie.forEach(cat => {
                const nbParticipants = cat.count * 4;
                if (cat._id === 'Primaire' || cat._id === 'College/Lycee') {
                    participantsEleves += nbParticipants;
                    fondsIncubation += (nbParticipants * 250);
                } else if (cat._id === 'Universitaire') {
                    participantsEtudiants += nbParticipants;
                    fondsIncubation += (nbParticipants * 500); // Hypothèse: 2x plus
                }
            });

            const objectifFonds = 50000;
            const resteAtteindre = Math.max(0, objectifFonds - fondsIncubation);
            const estViable = fondsIncubation >= objectifFonds;

            res.status(200).json(ApiResponse.success({
                totalDebats,
                debatsTermines,
                debatsEnCours,
                gainsDistribues: gainsTotaux[0]?.total || 0,
                fraisOrganisation: fraisTotaux[0]?.total || 0,
                debatsParCategorie,
                fondsElite: {
                    participantsEleves,
                    participantsEtudiants,
                    fondsAccumule: fondsIncubation,
                    objectif: objectifFonds,
                    resteAtteindre,
                    estViable
                }
            }));

        } catch (error) {
            logger.error('Erreur récupération statistiques:', error);
            res.status(500).json(ApiResponse.error('Erreur lors de la récupération des statistiques'));
        }
    }
}

module.exports = new DebatController();
