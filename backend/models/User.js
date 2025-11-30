const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est obligatoire'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Veuillez fournir un email valide']
    },
    tiktokLink: {
        type: String,
        trim: true
    },
    tiktokProfileName: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'jury', 'moderateur', 'jury_externe', 'juge_administratif'],
        default: 'moderateur'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password avant sauvegarde
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
