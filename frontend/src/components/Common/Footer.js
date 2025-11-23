import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌳 L'Arbre à Palabres</h3>
            <p>
              Plateforme éducative de débats qui encourage l'éloquence, 
              la réflexion critique et récompense le savoir des jeunes gabonais.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Liens Rapides</h4>
            <ul>
              <li><a href="/inscription">S'inscrire</a></li>
              <li><a href="/debats">Voir les Débats</a></li>
              <li><a href="/classement">Classement</a></li>
              <li><a href="/calculateur">Calculateur de Gains</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Catégories</h4>
            <ul>
              <li>Primaire (10-12 ans) - 500 FCFA</li>
              <li>Collège/Lycée (13-18 ans) - 1 000 FCFA</li>
              <li>Universitaire (19-40 ans) - 2 000 FCFA</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact & Support</h4>
            <ul>
              <li>📞 +241 77 765 496</li>
              <li>📧 support@arbrepalabres.ga</li>
              <li>📍 Libreville, Gabon</li>
              <li>🕒 8h-18h, Lundi-Vendredi</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>
            &copy; 2024 L'Arbre à Palabres. Tous droits réservés. | 
            Système de répartition 25%/75% | 
            Développé pour la jeunesse gabonaise
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;