import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { isAuthenticated, hasRole } = useAuth();

  const menuItems = [
    { id: 'accueil', label: 'Accueil', path: '/', public: true },
    { id: 'inscription', label: 'Inscription', path: '/inscription', public: true },
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
    window.location.href = path;
  };

  return (
    <nav className="app-nav">
      <div className="nav-container">
        {/* Menu principal */}
        {menuItems.map(item => (
          <button
            key={item.id}
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </button>
        ))}
        
        {/* Menu admin */}
        {isAuthenticated && hasRole('admin') && adminItems.map(item => (
          <button
            key={item.id}
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;