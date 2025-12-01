import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001';

let socket = null;

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Créer la connexion Socket.io
        if (!socket) {
            socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            socket.on('connect', () => {
                console.log('✅ Socket.io connecté');
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('❌ Socket.io déconnecté');
                setIsConnected(false);
            });

            socket.on('connect_error', (error) => {
                console.error('Erreur connexion Socket.io:', error);
                setIsConnected(false);
            });
        }

        return () => {
            // Ne pas déconnecter ici pour garder la connexion active
        };
    }, []);

    return { socket, isConnected };
};

export const useDebateUpdates = (onDebateCreated, onDebateUpdated, onDebateDeleted, category = null) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Rejoindre la room de catégorie si spécifiée
        if (category) {
            socket.emit('join-category', category);
        }

        // Écouter les événements de débat
        const handleDebateCreated = (debate) => {
            console.log('🆕 Nouveau débat créé:', debate);
            toast.success(`Nouveau débat: ${debate.theme_debat}`);
            if (onDebateCreated) onDebateCreated(debate);
        };

        const handleDebateUpdated = (debate) => {
            console.log('🔄 Débat mis à jour:', debate);
            if (onDebateUpdated) onDebateUpdated(debate);
        };

        const handleDebateDeleted = (debateId) => {
            console.log('🗑️ Débat supprimé:', debateId);
            if (onDebateDeleted) onDebateDeleted(debateId);
        };

        socket.on('debate-created', handleDebateCreated);
        socket.on('debate-updated', handleDebateUpdated);
        socket.on('debate-deleted', handleDebateDeleted);

        return () => {
            socket.off('debate-created', handleDebateCreated);
            socket.off('debate-updated', handleDebateUpdated);
            socket.off('debate-deleted', handleDebateDeleted);
        };
    }, [socket, isConnected, category, onDebateCreated, onDebateUpdated, onDebateDeleted]);

    return { isConnected };
};

export const useAdminUpdates = (onPaymentValidated, onCandidatRegistered) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Rejoindre la room admin
        socket.emit('join-admin');

        const handlePaymentValidated = (data) => {
            console.log('💰 Paiement validé:', data);
            toast.success('Nouveau paiement validé');
            if (onPaymentValidated) onPaymentValidated(data);
        };

        const handleCandidatRegistered = (candidat) => {
            console.log('👤 Nouveau candidat:', candidat);
            toast.info(`Nouveau candidat: ${candidat.prenom} ${candidat.nom}`);
            if (onCandidatRegistered) onCandidatRegistered(candidat);
        };

        socket.on('payment-validated', handlePaymentValidated);
        socket.on('candidat-registered', handleCandidatRegistered);

        return () => {
            socket.off('payment-validated', handlePaymentValidated);
            socket.off('candidat-registered', handleCandidatRegistered);
        };
    }, [socket, isConnected, onPaymentValidated, onCandidatRegistered]);

    return { isConnected };
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
