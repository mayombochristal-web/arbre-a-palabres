import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalleDebat.css';

const SalleDebat = ({ debatId }) => {
    const [debat, setDebat] = useState(null);

    useEffect(() => {
        fetchDebat();
    }, [debatId]);

    const fetchDebat = async () => {
        try {
            const response = await axios.get(`/api/debats/${debatId}`);
            setDebat(response.data.debat);
        } catch (error) {
            console.error('Erreur chargement débat:', error);
        }
    };

    if (!debat) return <div className="loading">Chargement...</div>;

    return (
        <div className="salle-debat">
            <div className="header-debat">
                <h2>{debat.theme_debat}</h2>
                <div className="badge-categorie">{debat.categorie}</div>
                {debat.type_debat === 'defi' && (
                    <div className="badge-defi">🏆 DÉFI</div>
                )}
            </div>

            <div className="cagnotte-display">
                <div className="cagnotte-icone">💰</div>
                <div className="cagnotte-info">
                    <div className="cagnotte-label">Cagnotte Totale</div>
                    <div className="cagnotte-montant">{debat.cagnotte_totale} FCFA</div>
                </div>
                <div className="repartition">
                    <div className="part-vainqueur">
                        <span>Vainqueur (75%)</span>
                        <strong>{debat.gain_vainqueur} FCFA</strong>
                    </div>
                    <div className="part-organisation">
                        <span>Organisation (25%)</span>
                        <strong>{debat.frais_organisation} FCFA</strong>
                    </div>
                </div>
            </div>

            <div className="participants-grid">
                {debat.participants_ids.map((participant, index) => (
                    <div key={participant._id} className="carte-participant">
                        <div className="numero-participant">{index + 1}</div>
                        <h3>{participant.prenom} {participant.nom}</h3>
                        <div className="score-participant">
                            {debat.scores_participants && debat.scores_participants[index]?.score_final
                                ? `${debat.scores_participants[index].score_final} / 20`
                                : '-'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="statut-debat">
                <span className={`badge-statut ${debat.statut}`}>
                    {debat.statut === 'en_attente' && '⏳ En attente'}
                    {debat.statut === 'en_cours' && '🎤 En cours'}
                    {debat.statut === 'termine' && '✅ Terminé'}
                </span>
            </div>
        </div>
    );
};

export default SalleDebat;
