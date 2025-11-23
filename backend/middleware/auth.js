const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupérer le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur depuis le token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Token error:', error);
      return res.status(401).json({
        error: 'Non autorisé, token invalide'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Non autorisé, aucun token'
    });
  }
};

// Middleware pour vérifier les rôles admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      error: 'Accès refusé, droits administrateur requis'
    });
  }
};

// Middleware pour vérifier les rôles jury
const jury = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'jury')) {
    next();
  } else {
    res.status(403).json({
      error: 'Accès refusé, droits jury requis'
    });
  }
};

module.exports = {
  protect,
  admin,
  jury
};