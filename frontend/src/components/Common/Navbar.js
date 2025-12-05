import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'accueil', label: 'Accueil', path: '/', public: true },
    { id: 'inscription', label: 'Inscription Candidat', path: '/inscription', public: true },
    { id: 'visitor', label: 'Inscription Visiteur', path: '/visitor-registration', public: true },
    { id: 'formations', label: 'Formations', path: '/formations', public: true },
    { id: 'debats', label: 'Débats', path: '/debats', public: true },
    { id: 'classement', label: 'Classement', path: '/classement', public: true },
    { id: 'candidats', label: 'Candidats', path: '/candidats', public: true },
    { id: 'calculateur', label: 'Calculateur', path: '/calculateur', public: true },
    { id: 'retrait', label: 'Demander Retrait', path: '/retrait', public: true },
    { id: 'transactions', label: 'Mes Transactions', path: '/transactions', public: true },
  ];

  const adminItems = [
    { id: 'admin', label: 'Administration', path: '/admin', admin: true },
    { id: 'validation', label: 'Validation Paiements', path: '/admin/validation', admin: true },
    { id: 'gestion-debats', label: 'Gestion Débats', path: '/admin/debats', admin: true },
    { id: 'nouveau-debat', label: 'Nouveau Débat', path: '/admin/nouveau-debat', admin: true },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isTabActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <nav className="app-nav" role="navigation" aria-label="Menu principal">
      <div className="nav-container">
        {/* Menu principal */}
        {menuItems.map(item => {
          const isActive = isTabActive(item.path);
          return (
            <button
              key={item.id}
              className={isActive ? 'active' : ''}
              onClick={() => handleNavigation(item.path)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Aller à la page ${item.label}`}
            >
              {item.label}
            </button>
          );
        })}

        {/* Menu admin */}
        {isAuthenticated && hasRole('admin') && adminItems.map(item => {
          const isActive = isTabActive(item.path);
          return (
            <button
              key={item.id}
              className={isActive ? 'active' : ''}
              onClick={() => handleNavigation(item.path)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Administration: ${item.label}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;