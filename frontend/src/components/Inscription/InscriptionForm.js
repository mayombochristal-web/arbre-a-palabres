import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
/* ... autres imports ... */

const InscriptionForm = () => {
  /* ... (déclarations d'état inchangées) ... */
  const [fileError, setFileError] = useState(null); // Nouvel état pour les erreurs de fichiers

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  /* ... autres watch et calculs ... */

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    setFileError(null); // Réinitialiser l'erreur
    
    if (file) {
      // Vérifier la taille du fichier (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        // CORRECTION: Remplacement de alert() par l'état local
        setFileError(`Le fichier ${type} ne doit pas dépasser 5MB.`);
        event.target.value = null; // Réinitialiser le champ
        return;
      }
      
      // Vérifier le type (PDF, JPEG, PNG)
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        // CORRECTION: Remplacement de alert() par l'état local
        setFileError(`Le fichier ${type} doit être au format PDF, JPEG ou PNG.`);
        event.target.value = null;
        return;
      }
      
      setFichiers(prev => ({ ...prev, [type]: file }));
    }
  };

  /* ... (Reste du composant) ... */
  
  return (
    <div className="form-container">
      {/* ... (Titre et aide) ... */}
      
      {/* Affichage de l'erreur de fichier si elle existe */}
      {fileError && (
        <div className="alert alert-error mb-2">{fileError}</div>
      )}

      {/* Reste du formulaire, en s'assurant que le champ de fichier est lié à handleFileChange */}
      {/* ... (Formulaire) ... */}
      
      {/* Exemple de champ de fichier avec l'appel de fonction */}
      <div className="form-group">
        <label htmlFor="carteEtudiant">Carte Étudiant/Scolaire ou Pièce d'Identité (PDF/Image, 5MB max)</label>
        <input 
          id="carteEtudiant" 
          type="file" 
          accept=".pdf, .jpg, .jpeg, .png"
          required
          onChange={(e) => handleFileChange(e, 'carteEtudiant')} // Utilisation de handleFileChange
        />
        {/* ... (Affichage des erreurs de hook-form) ... */}
      </div>

      {/* ... (Reste du formulaire et résultat) ... */}
    </div>
  );
};

export default InscriptionForm;