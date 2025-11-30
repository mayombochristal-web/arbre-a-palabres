import React, { useState } from 'react';
import { transactionService } from '../../services/api';
import './RetraitPage.css';

const RetraitPage = () => {
    const [formData, setFormData] = useState({
        candidatId: '',
        montant: '',
        methodeRetrait: 'AIRTEL_MONEY',
        numeroCompte: '',
        nomBeneficiaire: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [soldeActuel, setSoldeActuel] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validation
            if (!formData.candidatId || !formData.montant || !formData.numeroCompte || !formData.nomBeneficiaire) {
                setMessage({
                    type: 'error',
                    text: 'Veuillez remplir tous les champs obligatoires'
                });
                setLoading(false);
                return;
            }

            if (parseFloat(formData.montant) <= 0) {
                setMessage({
                    type: 'error',
                    text: 'Le montant doit être supérieur à 0'
                });
                setLoading(false);
                return;
            }

            // Envoyer la demande de retrait
            const response = await transactionService.demanderRetrait({
                candidatId: formData.candidatId,
                montant: parseFloat(formData.montant),
                methodeRetrait: formData.methodeRetrait,
                numeroCompte: formData.numeroCompte,
                nomBeneficiaire: formData.nomBeneficiaire
            });

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: `Demande de retrait enregistrée avec succès ! Référence: ${response.data.transaction.reference}. Nouveau solde: ${response.data.nouveauSolde} FCFA`
                });
                setSoldeActuel(response.data.nouveauSolde);

                // Réinitialiser le formulaire
                setFormData({
                    candidatId: formData.candidatId, // Garder l'ID du candidat
                    montant: '',
                    methodeRetrait: 'AIRTEL_MONEY',
                    numeroCompte: '',
                    nomBeneficiaire: ''
                });
            }

        } catch (error) {
            console.error('Erreur demande retrait:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || error.message || 'Erreur lors de la demande de retrait'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="retrait-page">
            <div className="container">
                <div className="retrait-header">
                    <h1>💰 Demander un Retrait</h1>
                    <p className="subtitle">Retirez vos gains accumulés</p>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.type === 'success' ? '✅ ' : '❌ '}
                        {message.text}
                    </div>
                )}

                {soldeActuel !== null && (
                    <div className="solde-info">
                        <span className="label">Solde actuel:</span>
                        <span className="montant">{soldeActuel.toLocaleString()} FCFA</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="retrait-form">
                    <div className="form-section">
                        <h3>Informations du Candidat</h3>

                        <div className="form-group">
                            <label htmlFor="candidatId">
                                ID du Candidat <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="candidatId"
                                name="candidatId"
                                value={formData.candidatId}
                                onChange={handleChange}
                                placeholder="Entrez votre ID de candidat"
                                required
                            />
                            <small className="help-text">
                                Vous pouvez trouver votre ID dans votre profil
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="montant">
                                Montant à retirer (FCFA) <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                id="montant"
                                name="montant"
                                value={formData.montant}
                                onChange={handleChange}
                                placeholder="Ex: 5000"
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Informations de Paiement</h3>

                        <div className="form-group">
                            <label htmlFor="methodeRetrait">
                                Méthode de Retrait <span className="required">*</span>
                            </label>
                            <select
                                id="methodeRetrait"
                                name="methodeRetrait"
                                value={formData.methodeRetrait}
                                onChange={handleChange}
                                required
                            >
                                <option value="AIRTEL_MONEY">Airtel Money</option>
                                <option value="MOMO">MTN Mobile Money</option>
                                <option value="VIREMENT_BANCAIRE">Virement Bancaire</option>
                                <option value="CASH">Retrait en Espèces</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="numeroCompte">
                                Numéro de Compte / Téléphone <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="numeroCompte"
                                name="numeroCompte"
                                value={formData.numeroCompte}
                                onChange={handleChange}
                                placeholder={
                                    formData.methodeRetrait === 'VIREMENT_BANCAIRE'
                                        ? 'Ex: GA21 1234 5678 9012 3456 7890'
                                        : 'Ex: +241 XX XX XX XX'
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nomBeneficiaire">
                                Nom du Bénéficiaire <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="nomBeneficiaire"
                                name="nomBeneficiaire"
                                value={formData.nomBeneficiaire}
                                onChange={handleChange}
                                placeholder="Nom complet du bénéficiaire"
                                required
                            />
                            <small className="help-text">
                                Le nom doit correspondre au compte de retrait
                            </small>
                        </div>
                    </div>

                    <div className="info-box">
                        <h4>ℹ️ Informations Importantes</h4>
                        <ul>
                            <li>Le montant sera débité immédiatement de votre solde</li>
                            <li>La demande sera validée par un administrateur sous 24-48h</li>
                            <li>Vous recevrez une notification une fois le retrait traité</li>
                            <li>En cas de rejet, le montant sera remboursé sur votre compte</li>
                        </ul>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Traitement en cours...' : 'Demander le Retrait'}
                        </button>
                    </div>
                </form>

                <div className="help-section">
                    <h3>Besoin d'aide ?</h3>
                    <p>
                        Pour toute question concernant les retraits, contactez-nous à{' '}
                        <a href="mailto:support@arbre-palabres.ga">support@arbre-palabres.ga</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RetraitPage;
