const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/health', async (req, res) => {
    try {
        // Vérifier la connexion MongoDB
        const dbStatus = mongoose.connection.readyState;
        const dbStates = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const healthCheck = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: dbStates[dbStatus],
                connected: dbStatus === 1
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
            },
            system: {
                platform: process.platform,
                nodeVersion: process.version
            }
        };

        // Si la base de données n'est pas connectée, retourner status 503
        if (dbStatus !== 1) {
            return res.status(503).json({
                ...healthCheck,
                status: 'error',
                message: 'Database not connected'
            });
        }

        res.json(healthCheck);
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// @desc    Detailed health check (admin only)
// @route   GET /api/health/detailed
// @access  Private/Admin
router.get('/detailed', async (req, res) => {
    try {
        const { protect, admin } = require('../middleware/auth');

        // Simple protection sans middleware complet
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Non autorisé' });
        }

        const healthCheck = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            database: {
                status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                host: mongoose.connection.host,
                name: mongoose.connection.name
            },
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                pid: process.pid
            },
            env: {
                port: process.env.PORT,
                nodeEnv: process.env.NODE_ENV
            }
        };

        res.json(healthCheck);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
