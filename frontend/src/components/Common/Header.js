import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import du hook de navigation
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate(); // Initialisation

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <h1>🌳 L'Arbre à Palabres</h1>
            <p>Plateforme de débats éducatifs pour la jeunesse gabonaise</p>
          </div>
          
          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-greeting">
                  Bonjour, <strong>{user?.name}</strong>
                </span>
                <div className="user-role-badge">
                  {user?.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
                </div>
                <button 
                  onClick={logout}
                  className="btn-secondary small"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="btn-secondary small"
                  // CORRECTION: Remplacement de window.location.href par navigate
                  onClick={() => navigate('/connexion')}
                >
                  Connexion Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;