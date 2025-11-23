import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { candidatService } from '../../services/api';
import { calculService } from '../../services/calculService';
import { validerEmail, validerTelephone, formaterNom } from '../../utils/formatters';
import Loading from '../Common/Loading';

const InscriptionForm = () => {
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [fichiers, setFichiers] = useState({
    carteEtudiant: null,
    notes: null
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  const dateNaissance = watch('dateNaissance');
  const nationalite = watch('nationalite');

  // Calculer l'âge et la catégorie en temps réel
  const infosCandidature = dateNaissance && nationalite ? 
    calculService.verifierEligibilite(dateNaissance, nationalite) : null;

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non autorisé. Formats acceptés: PDF, JPG, JPEG, PNG');
        return;
      }
      
      setFichiers(prev => ({ ...prev, [type]: file }));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Vérifier l'éligibilité finale
      const verification = calculService.verifierEligibilite(data.dateNaissance, data.nationalite);
      
      if (!verification.estEligible) {
        alert('Vous n\'êtes pas éligible pour participer. Vérifiez votre âge et nationalité.');
        return;
      }

      // Vérifier les fichiers
      if (!fichiers.carteEtudiant || !fichiers.notes) {
        alert('Veuillez télécharger tous les documents requis');
        return;
      }

      // Préparer les données
      const candidatData = {
        ...data,
        fichiers,
        nationalite: 'Gabonaise' // Forcer la nationalité gabonaise
      };

      const response = await candidatService.inscrire(candidatData);
      
      if (response.data.success) {
        setResultat(response.data);
      } else {
        throw new Error(response.data.error);
      }

    } catch (error) {
      console.error('Erreur inscription:', error);
      alert(`Erreur: ${error.message || 'Une erreur est survenue lors de l\'inscription'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Traitement de votre inscription..." />;
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Inscription au Concours "L'Arbre à Palabres"</h2>
        <p className="help-text">
          Remplissez le formulaire ci-dessous pour participer à nos débats éducatifs.
          Tous les champs sont obligatoires.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Informations personnelles */}
          <div className="form-section">
            <h3>Informations Personnelles</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  id="nom"
                  type="text"
                  {...register('nom', { 
                    required: 'Le nom est obligatoire',
                    minLength: { value: 2, message: 'Le nom doit avoir au moins 2 caractères' }
                  })}
                  className={errors.nom ? 'error' : ''}
                  onChange={(e) => setValue('nom', formaterNom(e.target.value))}
                />
                {errors.nom && <span className="error-message">{errors.nom.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  id="prenom"
                  type="text"
                  {...register('prenom', { 
                    required: 'Le prénom est obligatoire',
                    minLength: { value: 2, message: 'Le prénom doit avoir au moins 2 caractères' }
                  })}
                  className={errors.prenom ? 'error' : ''}
                  onChange={(e) => setValue('prenom', formaterNom(e.target.value))}
                />
                {errors.prenom && <span className="error-message">{errors.prenom.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateNaissance">Date de Naissance *</label>
                <input
                  id="dateNaissance"
                  type="date"
                  {...register('dateNaissance', { 
                    required: 'La date de naissance est obligatoire'
                  })}
                  className={errors.dateNaissance ? 'error' : ''}
                />
                {errors.dateNaissance && <span className="error-message">{errors.dateNaissance.message}</span>}
                
                {infosCandidature && (
                  <div className="help-text">
                    Âge: {infosCandidature.age} ans | 
                    Catégorie: {infosCandidature.categorie} | 
                    Frais: {calculService.formaterMontant(infosCandidature.fraisInscription)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nationalite">Nationalité *</label>
                <select
                  id="nationalite"
                  {...register('nationalite', { required: 'La nationalité est obligatoire' })}
                  className={errors.nationalite ? 'error' : ''}
                  defaultValue="Gabonaise"
                >
                  <option value="Gabonaise">Gabonaise</option>
                </select>
                {errors.nationalite && <span className="error-message">{errors.nationalite.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'L\'email est obligatoire',
                    validate: validerEmail
                  })}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">
                  {errors.email.type === 'validate' ? 'Email invalide' : errors.email.message}
                </span>}
              </div>

              <div className="form-group">
                <label htmlFor="telephone">Téléphone *</label>
                <input
                  id="telephone"
                  type="tel"
                  placeholder="+241 XX XXX XXX"
                  {...register('telephone', { 
                    required: 'Le téléphone est obligatoire',
                    validate: validerTelephone
                  })}
                  className={errors.telephone ? 'error' : ''}
                />
                {errors.telephone && <span className="error-message">
                  {errors.telephone.type === 'validate' ? 'Numéro gabonais invalide' : errors.telephone.message}
                </span>}
                <div className="help-text">Format: +241 XX XXX XXX ou 0X XX XX XX</div>
              </div>
            </div>
          </div>

          {/* Informations scolaires */}
          <div className="form-section">
            <h3>Informations Scolaires</h3>
            
            <div className="form-group">
              <label htmlFor="nomEtablissement">Nom de l'Établissement *</label>
              <input
                id="nomEtablissement"
                type="text"
                placeholder="Ex: Lycée National Léon Mba"
                {...register('nomEtablissement', { 
                  required: 'Le nom de l\'établissement est obligatoire'
                })}
                className={errors.nomEtablissement ? 'error' : ''}
              />
              {errors.nomEtablissement && <span className="error-message">{errors.nomEtablissement.message}</span>}
            </div>
          </div>

          {/* Documents à télécharger */}
          <div className="form-section">
            <h3>Documents Requis</h3>
            <p className="help-text">
              Téléchargez les documents suivants (PDF, JPG, PNG - max 5MB chacun)
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Carte d'Étudiant *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="carteEtudiant"
                    className="file-input"
                    onChange={(e) => handleFileChange(e, 'carteEtudiant')}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="carteEtudiant" className="file-label">
                    <div className="file-icon">📎</div>
                    <span>
                      {fichiers.carteEtudiant ? 
                        fichiers.carteEtudiant.name : 
                        'Choisir la carte d\'étudiant'
                      }
                    </span>
                  </label>
                </div>
                {!fichiers.carteEtudiant && (
                  <div className="error-message">La carte d'étudiant est requise</div>
                )}
              </div>

              <div className="form-group">
                <label>Relevé de Notes *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="notes"
                    className="file-input"
                    onChange={(e) => handleFileChange(e, 'notes')}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="notes" className="file-label">
                    <div className="file-icon">📊</div>
                    <span>
                      {fichiers.notes ? 
                        fichiers.notes.name : 
                        'Choisir le relevé de notes'
                      }
                    </span>
                  </label>
                </div>
                {!fichiers.notes && (
                  <div className="error-message">Le relevé de notes est requis</div>
                )}
              </div>
            </div>
          </div>

          {/* Résumé des frais */}
          {infosCandidature && infosCandidature.estEligible && (
            <div className="form-section summary-section">
              <h3>Récapitulatif</h3>
              <div className="summary-card">
                <div className="summary-item">
                  <span>Catégorie:</span>
                  <strong>{infosCandidature.categorie}</strong>
                </div>
                <div className="summary-item">
                  <span>Frais d'inscription:</span>
                  <strong>{calculService.formaterMontant(infosCandidature.fraisInscription)}</strong>
                </div>
                <div className="summary-item">
                  <span>Gain potentiel par débat:</span>
                  <strong>
                    {calculService.formaterMontant(
                      calculService.calculerGainsDebat(infosCandidature.categorie).gainVainqueur
                    )}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary large"
              disabled={!infosCandidature?.estEligible || !fichiers.carteEtudiant || !fichiers.notes}
            >
              Soumettre l'Inscription
            </button>
          </div>
        </form>

        {/* Résultat de l'inscription */}
        {resultat && (
          <div className="result-section alert alert-success">
            <h3>✅ Inscription Soumise avec Succès!</h3>
            <p><strong>Message:</strong> {resultat.message}</p>
            <div className="candidat-info">
              <p><strong>Nom:</strong> {resultat.candidat.prenom} {resultat.candidat.nom}</p>
              <p><strong>Catégorie:</strong> {resultat.candidat.categorie}</p>
              <p><strong>Frais d'inscription:</strong> {calculService.formaterMontant(resultat.candidat.fraisInscription)}</p>
              <p><strong>Statut:</strong> {resultat.candidat.statut}</p>
            </div>
            <div className="payment-instructions">
              <h4>Instructions de Paiement:</h4>
              <ol>
                <li>Ouvrez votre application Airtel Money</li>
                <li>Effectuez un paiement de <strong>{calculService.formaterMontant(resultat.candidat.fraisInscription)}</strong></li>
                <li>Vers le numéro: <strong>+241 77 765 496</strong></li>
                <li>Ajoutez comme référence: <strong>{resultat.candidat.id.slice(-6)}</strong></li>
                <li>Attendez la validation par notre équipe (24-48h)</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InscriptionForm;