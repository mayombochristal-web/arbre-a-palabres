import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-logo">
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
                  onClick={() => window.location.href = '/connexion'}
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