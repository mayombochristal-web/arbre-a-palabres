const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, registrationLimiter } = require('../middleware/rateLimiter');
const { validate, loginSchema } = require('../middleware/validation');

// Debug route checker
router.use((req, res, next) => {
    console.log(`[AUTH] ${req.method} ${req.originalUrl}`);
    next();
});

// Register
router.post('/register', registrationLimiter, register);

// Login (POST only)
router.post('/login', authLimiter, validate(loginSchema), login);

// Login info for GET requests (browser testing)
router.get('/login', (req, res) => {
    res.json({
        success: false,
        message: "Use POST method with email and password to login",
        required: { email: "string", password: "string" }
    });
});

// Profil utilisateur connecté
router.get('/profile', protect, getMe);

// For testing - confirms auth route is loaded
router.get('/', (req, res) => {
    res.json({ success: true, message: "Auth route OK" });
});

module.exports = router;
