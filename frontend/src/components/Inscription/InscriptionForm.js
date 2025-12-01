import React, { useState } from "react";
import "./InscriptionForm.css";

import config from "../../config";

const API_BASE_URL = config.API_URL;

export default function InscriptionForm() {
  const [role, setRole] = useState("candidat"); // candidat, jury_externe, juge_administratif
  const [typeCandidat, setTypeCandidat] = useState("EleveEtudiant"); // EleveEtudiant, Entrepreneur

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    nationalite: "Gabonaise",
    telephone: "",
    email: "",
    nomEtablissement: "",
    password: "", // Pour Jury/Juge
    tiktokLink: "",
    tiktokProfileName: "",
    paymentMessage: ""
  });

  // Date de naissance séparée
  const [dob, setDob] = useState({ day: "", month: "", year: "" });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Génération des options de date
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDobChange = (field, value) => {
    setDob({ ...dob, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      // Construction de la date de naissance
      let dateNaissance = null;
      if (dob.day && dob.month && dob.year) {
        const monthIndex = months.indexOf(dob.month) + 1;
        dateNaissance = `${dob.year}-${monthIndex.toString().padStart(2, '0')}-${dob.day.toString().padStart(2, '0')}`;
      }

      const payload = {
        ...formData,
        dateNaissance,
        role: role === 'candidat' ? 'candidat' : role,
        typeCandidat: role === 'candidat' ? typeCandidat : undefined
      };

      // Détermination de l'URL et du corps de la requête
      let url = `${API_BASE_URL}/candidats/inscription`;
      if (role !== 'candidat') {
        url = `${API_BASE_URL}/auth/register`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || "Inscription réussie ! 🎉");

        // Reset partiel
        setFormData({
          ...formData,
          nom: "", prenom: "", email: "", telephone: "",
          tiktokLink: "", tiktokProfileName: "", paymentMessage: "", password: ""
        });
      } else {
        setMessage(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Impossible de contacter le serveur.");
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Inscription au Concours d'Éloquence</h2>

      {message && <div className={`message ${isSuccess ? 'success' : 'error'}`}>{message}</div>}

      <form onSubmit={handleSubmit}>

        {/* Choix du Rôle */}
        <div className="input-group">
          <label>Je souhaite m'inscrire en tant que :</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="candidat">Candidat</option>
            <option value="jury_externe">Membre du Jury Externe</option>
            <option value="juge_administratif">Juge Administratif</option>
          </select>
        </div>

        {/* Choix Type Candidat (si Candidat) */}
        {role === 'candidat' && (
          <div className="input-group">
            <label>Type de Candidat :</label>
            <select value={typeCandidat} onChange={(e) => setTypeCandidat(e.target.value)}>
              <option value="EleveEtudiant">Élève / Étudiant</option>
              <option value="Entrepreneur">Entrepreneur (Frais: 5000 FCFA)</option>
            </select>
          </div>
        )}

        <div className="row">
          <div className="input-group">
            <label>Nom *</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Prénom *</label>
            <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
          </div>
        </div>

        {/* Date de Naissance Simplifiée */}
        <div className="input-group">
          <label>Date de naissance *</label>
          <div className="dob-container" style={{ display: 'flex', gap: '10px' }}>
            <select value={dob.day} onChange={(e) => handleDobChange('day', e.target.value)} required>
              <option value="">Jour</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={dob.month} onChange={(e) => handleDobChange('month', e.target.value)} required>
              <option value="">Mois</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={dob.year} onChange={(e) => handleDobChange('year', e.target.value)} required>
              <option value="">Année</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Nationalité *</label>
            <input type="text" name="nationalite" value={formData.nationalite} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Téléphone (Airtel/MTN) *</label>
            <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} required />
          </div>
        </div>

        <div className="input-group">
          <label>Email {role !== 'candidat' ? '*' : '(optionnel)'}</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required={role !== 'candidat'} />
        </div>

        {role === 'candidat' && (
          <div className="input-group">
            <label>Établissement / Université / Entreprise *</label>
            <input type="text" name="nomEtablissement" value={formData.nomEtablissement} onChange={handleChange} required />
          </div>
        )}

        {/* Mot de passe pour les rôles administratifs */}
        {role !== 'candidat' && (
          <div className="input-group">
            <label>Mot de passe *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
          </div>
        )}

        {/* TikTok Fields */}
        <div className="row">
          <div className="input-group">
            <label>Lien TikTok (Optionnel)</label>
            <input type="text" name="tiktokLink" value={formData.tiktokLink} onChange={handleChange} placeholder="https://tiktok.com/@..." />
          </div>
          <div className="input-group">
            <label>Nom Profil TikTok (Optionnel)</label>
            <input type="text" name="tiktokProfileName" value={formData.tiktokProfileName} onChange={handleChange} placeholder="@monprofil" />
          </div>
        </div>

        {/* Paiement pour Candidats */}
        {role === 'candidat' && (
          <div className="payment-section" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3>Paiement des Frais</h3>
            <p>
              Veuillez envoyer <strong>{typeCandidat === 'Entrepreneur' ? '5000' : 'vos frais selon catégorie'} FCFA</strong> par Airtel Money au <strong>077 76 54 96</strong>.
            </p>
            <div className="input-group">
              <label>Preuve de paiement (Copiez le SMS Airtel Money ici) :</label>
              <textarea
                name="paymentMessage"
                value={formData.paymentMessage}
                onChange={handleChange}
                placeholder="Ex: Trans. ID: PP230523.1545.H89999. Vous avez envoyé..."
                rows="4"
              />
              <small>Le système validera automatiquement votre paiement si le message est correct.</small>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? "Traitement..." : "Valider l'inscription"}
        </button>
      </form>
    </div>
  );
}
