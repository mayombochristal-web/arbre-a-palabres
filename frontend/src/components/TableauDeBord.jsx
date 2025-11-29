import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TableauDeBord.css';

const TableauDeBord = ({ candidatId }) => {
    const [candidat, setCandidatData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCandidatData();
    }, [candidatId]);

    const fetchCandidatData = async () => {
        try {
            const response = await axios.get(`/api/candidats/${candidatId}`);
            setCandidatData(response.data.candidat);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement candidat:', error);
            setLoading(false);
        }
    };

    const lancerDefi = () => {
        window.location.href = '/creer-defi';
    };

    if (loading) return <div className="loading">Chargement...</div>;

    return (
        <div className="tableau-de-bord">
            <div className="header-arbre">
                <h1>🌳 L'Arbre à Palabres</h1>
                <div className="barre-couleurs">
                    <div className="barre-vert"></div>
                    <div className="barre-jaune"></div>
                    <div className="barre-bleu"></div>
                </div>
            </div>

            <div className="carte-solde">
                <h2>Votre Solde</h2>
                <div className="montant-solde">{candidat.soldeActuel} FCFA</div>
                <div className="stats-rapides">
                    <div className="stat">
                        <span className="label">Victoires:</span>
                        <span className="valeur">{candidat.nombreVictoires}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Défaites:</span>
                        <span className="valeur">{candidat.nombreDefaites}</span>
                    </div>
                </div>
            </div>

            {candidat.tropheeActuel && (
                <div className="carte-trophee">
                    <h3>🏆 Votre Trophée</h3>
                    <p>{candidat.tropheeActuel.nom}</p>
                    <button
                        className="btn-defi"
                        onClick={lancerDefi}
                        disabled={candidat.soldeActuel <= 0}
                    >
                        Remettre mon Trophée en Jeu 🏆
                    </button>
                </div>
            )}

            <div className="historique-debats">
                <h3>Historique des Débats</h3>
                {/* Liste des débats */}
            </div>
        </div>
    );
};

export default TableauDeBord;
