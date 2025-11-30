import React, { useState } from "react";
import "./InscriptionForm.css";

const API_URL = "https://arbre-palabres-backend.onrender.com/api/candidats";

export default function InscriptionForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    age: "",
    categorie: "",
    telephone: "",
    email: "",
    ville: "",
    etablissement: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Mise à jour simple des champs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Inscription réussie ! 🎉");
        setFormData({
          nom: "",
          prenom: "",
          age: "",
          categorie: "",
          telephone: "",
          email: "",
          ville: "",
          etablissement: "",
        });
      } else {
        setMessage(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setMessage("Impossible de contacter le serveur. Vérifie ta connexion.");
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Inscription au Concours d'Éloquence</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="input-group">
            <label>Nom *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Prénom *</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Âge *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="10"
              max="40"
            />
          </div>

          <div className="input-group">
            <label>Catégorie *</label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
            >
              <option value="">Choisir...</option>
              <option value="primaire">Primaire</option>
              <option value="college">Collège</option>
              <option value="lycee">Lycée</option>
              <option value="universitaire">Étudiant</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>Téléphone (Airtel/MTN) *</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Ex : +24106234567"
            required
          />
        </div>

        <div className="input-group">
          <label>Email (optionnel)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemple@gmail.com"
          />
        </div>

        <div className="input-group">
          <label>Ville *</label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Établissement / Université *</label>
          <input
            type="text"
            name="etablissement"
            value={formData.etablissement}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Envoi en cours..." : "Valider l'inscription"}
        </button>
      </form>
    </div>
  );
}
