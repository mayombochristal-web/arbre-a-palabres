const ApiResponse = require('../utils/ApiResponse');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Exemple simplifié (tu remplaceras par ta logique réelle)
        if (!email || !password) {
            return ApiResponse.error(res, "Email et mot de passe requis", 400);
        }

        return ApiResponse.success(res, { email }, "Connexion réussie");
    } catch (error) {
        return ApiResponse.error(res, "Erreur serveur", 500);
    }
};

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return ApiResponse.error(res, "Email et mot de passe requis", 400);
        }

        return ApiResponse.success(res, { email }, "Inscription réussie");
    } catch (error) {
        return ApiResponse.error(res, "Erreur serveur", 500);
    }
};

exports.getMe = async (req, res) => {
    try {
        if (!req.user) {
            return ApiResponse.error(res, "Utilisateur non trouvé", 404);
        }
        return ApiResponse.success(res, req.user, "Profil récupéré");
    } catch (error) {
        return ApiResponse.error(res, "Erreur serveur", 500);
    }
};
