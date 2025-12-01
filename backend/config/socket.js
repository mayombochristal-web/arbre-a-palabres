const socketIO = require('socket.io');
const logger = require('../config/logger');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: [
                "http://localhost:3000",
                "https://arbre-a-palabre-9e83a.web.app",
                "https://arbre-palabres-backend.onrender.com"
            ],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Client connecté: ${socket.id}`);

        // Rejoindre une room spécifique (par exemple, pour une catégorie)
        socket.on('join-category', (category) => {
            socket.join(`category-${category}`);
            logger.info(`Client ${socket.id} a rejoint category-${category}`);
        });

        // Rejoindre la room admin
        socket.on('join-admin', () => {
            socket.join('admin-room');
            logger.info(`Admin ${socket.id} a rejoint admin-room`);
        });

        // Rejoindre une room de débat spécifique
        socket.on('join-debate', (debatId) => {
            socket.join(`debate-${debatId}`);
            logger.info(`Client ${socket.id} a rejoint debate-${debatId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Client déconnecté: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Fonctions utilitaires pour émettre des événements
const emitDebateCreated = (debate) => {
    if (io) {
        // Notifier tous les clients de la catégorie
        io.to(`category-${debate.categorie}`).emit('debate-created', debate);
        // Notifier tous les admins
        io.to('admin-room').emit('debate-created', debate);
        logger.info(`Débat créé émis: ${debate._id}`);
    }
};

const emitDebateUpdated = (debate) => {
    if (io) {
        io.to(`debate-${debate._id}`).emit('debate-updated', debate);
        io.to(`category-${debate.categorie}`).emit('debate-updated', debate);
        io.to('admin-room').emit('debate-updated', debate);
        logger.info(`Débat mis à jour émis: ${debate._id}`);
    }
};

const emitDebateDeleted = (debateId, categorie) => {
    if (io) {
        io.to(`debate-${debateId}`).emit('debate-deleted', debateId);
        io.to(`category-${categorie}`).emit('debate-deleted', debateId);
        io.to('admin-room').emit('debate-deleted', debateId);
        logger.info(`Débat supprimé émis: ${debateId}`);
    }
};

const emitPaymentValidated = (candidatId, transaction) => {
    if (io) {
        io.to('admin-room').emit('payment-validated', { candidatId, transaction });
        logger.info(`Paiement validé émis pour candidat: ${candidatId}`);
    }
};

const emitCandidatRegistered = (candidat) => {
    if (io) {
        io.to('admin-room').emit('candidat-registered', candidat);
        logger.info(`Nouveau candidat émis: ${candidat._id}`);
    }
};

const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user-${userId}`).emit('notification', notification);
        logger.info(`Notification envoyée à user: ${userId}`);
    }
};

module.exports = {
    initializeSocket,
    getIO,
    emitDebateCreated,
    emitDebateUpdated,
    emitDebateDeleted,
    emitPaymentValidated,
    emitCandidatRegistered,
    emitNotification
};
