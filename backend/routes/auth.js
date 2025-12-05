const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, registrationLimiter } = require('../middleware/rateLimiter');
const { validate, loginSchema } = require('../middleware/validation');

router.post('/register', registrationLimiter, register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/profile', protect, getMe);

module.exports = router;
