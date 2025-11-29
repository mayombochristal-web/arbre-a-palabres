import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { candidatService } from '../../services/api';
import { calculService } from '../../services/calculService';

const InscriptionForm = () => {
  const [fichiers, setFichiers] = useState({
    carteEtudiant: null
  });
  const [fileError, setFileError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const dateNaissance = watch('dateNaissance');

  // Calculer l'âge et la catégorie
  const age = dateNaissance ? calculService.calculerAge(dateNaissance) : null;
  const categorie = age ? calculService.determinerCategorie(age) : null;
  const fraisInscription = categorie ? calculService.FRAIS_INSCRIPTION[categorie] : 0;

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    setFileError(null);

    if (file) {
      // Vérifier la taille du fichier (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`Le fichier ${type} ne doit pas dépasser 5MB.`);
        event.target.value = null;
        return;
      }

      // Vérifier le type (PDF, JPEG, PNG)
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        setFileError(`Le fichier ${type} doit être au format PDF, JPEG ou PNG.`);
        event.target.value = null;
        return;
      }

      setFichiers(prev => ({ ...prev, [type]: file }));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setResultat(null);

    try {
      // Vérifier que les fichiers sont présents
      if (!fichiers.carteEtudiant) {
        setFileError('La carte étudiant/pièce d\'identité est obligatoire');
        setLoading(false);
        return;
      }

      // Préparer les données
      const candidatData = {
        ...data,
        fichiers: fichiers
      };

      // Envoyer la requête
      const response = await candidatService.inscrire(candidatData);

      if (response.data.success) {
        setResultat({
          success: true,
          message: 'Inscription réussie !',
          reference: response.data.reference,
          frais: fraisInscription
        });

        // Réinitialiser le formulaire
        document.getElementById('inscriptionForm').reset();
        setFichiers({ carteEtudiant: null });
      }
    } catch (err) {
      console.error('Erreur inscription:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#2d5016', marginBottom: '10px' }}>Inscription - L'Arbre à Palabres</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Remplissez ce formulaire pour vous inscrire à la plateforme de débats éducatifs.
      </p>

      {/* Affichage des erreurs */}
      {error && (
        <div className="alert alert-error" style={{ backgroundColor: '#fee', color: '#c00', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {fileError && (
        <div className="alert alert-error" style={{ backgroundColor: '#fee', color: '#c00', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          {fileError}
        </div>
      )}

      {/* Affichage du résultat */}
      {resultat && resultat.success && (
        <div className="alert alert-success" style={{ backgroundColor: '#efe', color: '#060', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>✅ {resultat.message}</h3>
          <p><strong>Référence :</strong> {resultat.reference}</p>
          <p><strong>Frais d'inscription :</strong> {resultat.frais} FCFA</p>
          <p>Veuillez effectuer le paiement via Airtel Money au numéro : <strong>074 00 42 00</strong></p>
          <p>Mentionnez votre référence dans le message de paiement.</p>
        </div>
      )}

      <form id="inscriptionForm" onSubmit={handleSubmit(onSubmit)} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>

        {/* Informations personnelles */}
        <h3 style={{ color: '#2d5016', marginBottom: '20px', borderBottom: '2px solid #2d5016', paddingBottom: '10px' }}>Informations Personnelles</h3>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="nom">Nom *</label>
          <input
            id="nom"
            type="text"
            {...register('nom', { required: 'Le nom est obligatoire' })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {errors.nom && <span style={{ color: '#c00', fontSize: '14px' }}>{errors.nom.message}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="prenom">Prénom *</label>
          <input
            id="prenom"
            type="text"
            {...register('prenom', { required: 'Le prénom est obligatoire' })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {errors.prenom && <span style={{ color: '#c00', fontSize: '14px' }}>{errors.prenom.message}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="dateNaissance">Date de Naissance *</label>
          <input
            id="dateNaissance"
            type="date"
            {...register('dateNaissance', { required: 'La date de naissance est obligatoire' })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {errors.dateNaissance && <span style={{ color: '#c00', fontSize: '14px' }}>{errors.dateNaissance.message}</span>}
          {categorie && (
            <p style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
              Catégorie : <strong>{categorie}</strong> | Frais : <strong>{fraisInscription} FCFA</strong>
            </p>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'L\'email est obligatoire',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide'
              }
            })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {errors.email && <span style={{ color: '#c00', fontSize: '14px' }}>{errors.email.message}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="telephone">Téléphone (Airtel Money) *</label>
          <input
            id="telephone"
            type="tel"
            placeholder="Ex: +241 07 40 04 20 0"
            {...register('telephone', {
              required: 'Le téléphone est obligatoire',
              pattern: {
                value: /^\+?[0-9]{8,15}$/,
                message: 'Numéro de téléphone invalide'
              }
            })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {errors.telephone && <span style={{ color: '#c00', fontSize: '14px' }}>{errors.telephone.message}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="nationalite">Nationalité *</label>
          <input
            id="nationalite"
            type="text"
            defaultValue="Gabonaise"
            {...register('nationalite', { required: 'La nationalité est obligatoire' })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {errors.nationalite && <span style={{ color: '#c00', fontSize: '14px' }}>{errors.nationalite.message}</span>}
        </div>

        {/* Informations scolaires */}
        <h3 style={{ color: '#2d5016', marginTop: '30px', marginBottom: '20px', borderBottom: '2px solid #2d5016', paddingBottom: '10px' }}>Informations Scolaires</h3>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="nomEtablissement">Nom de l'Établissement *</label>
          <input
            id="nomEtablissement"
            type="text"
            {...register('nomEtablissement', { required: 'Le nom de l\'établissement est obligatoire' })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {errors.nomEtablissement && <span style={{ color: '#c00', fontSize: '14px' }}>{errors.nomEtablissement.message}</span>}
        </div>

        {/* Documents */}
        <h3 style={{ color: '#2d5016', marginTop: '30px', marginBottom: '20px', borderBottom: '2px solid #2d5016', paddingBottom: '10px' }}>Documents</h3>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="carteEtudiant">Carte Étudiant/Scolaire ou Pièce d'Identité * (PDF/Image, 5MB max)</label>
          <input
            id="carteEtudiant"
            type="file"
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={(e) => handleFileChange(e, 'carteEtudiant')}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {fichiers.carteEtudiant && (
            <p style={{ marginTop: '5px', color: '#060', fontSize: '14px' }}>✓ {fichiers.carteEtudiant.name}</p>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#ccc' : '#2d5016',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#3d6026')}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#2d5016')}
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
};

export default InscriptionForm;