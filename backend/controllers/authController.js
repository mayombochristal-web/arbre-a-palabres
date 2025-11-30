const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Générer un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Enregistrer un nouvel utilisateur (Jury, Juge, etc.)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, password, role, tiktokLink, tiktokProfileName } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
        }

        // Créer l'utilisateur
        const user = await User.create({
            nom,
            prenom,
            email,
            password,
            role: role || 'moderateur', // Par défaut modérateur si non spécifié, mais le front enverra le bon rôle
            tiktokLink,
            tiktokProfileName
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ error: 'Données utilisateur invalides' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
};

// @desc    Authentifier un utilisateur & récupérer le token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier l'email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
};

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/auth/profile
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                tiktokLink: user.tiktokLink,
                tiktokProfileName: user.tiktokProfileName
            });
        } else {
            res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
