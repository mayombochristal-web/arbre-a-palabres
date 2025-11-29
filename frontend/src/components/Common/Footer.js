import React from 'react';
import { Link } from 'react-router-dom';

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
              <li><Link to="/inscription">S'inscrire</Link></li>
              <li><Link to="/debats">Voir les Débats</Link></li>
              <li><Link to="/classement">Classement</Link></li>
              <li><Link to="/calculateur">Calculateur de Gains</Link></li>
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
              <li>📧 mayombochristal@gmail.com</li>
              <li>🎵 <a href="https://www.tiktok.com/@baguebe" target="_blank" rel="noopener noreferrer">@baguebe sur TikTok</a></li>
              <li>📍 Libreville, Gabon</li>
              <li>🕒 8h-18h, Lundi-Vendredi</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; 2024 L'Arbre à Palabres. Tous droits réservés. |
            <Link to="/politique-confidentialite">Politique de Confidentialité</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;