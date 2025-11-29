import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Import de useNavigate et useLocation

// Navbar n'a plus besoin des props activeTab et setActiveTab
const Navbar = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook pour obtenir le chemin actuel

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

  // Fonction de navigation corrigée
  const handleNavigation = (path) => {
    // CORRECTION: Utilisation de navigate() au lieu de window.location.href
    navigate(path); 
  };
  
  // Fonction pour déterminer si un onglet est actif (basé sur l'URL)
  const isTabActive = (path) => {
    // Vérifie si le chemin de la route commence par le chemin de l'élément (gestion des sous-routes)
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };


  return (
    <nav className="app-nav">
      <div className="nav-container">
        {/* Menu principal */}
        {menuItems.map(item => (
          <button
            key={item.id}
            // Changement: Utilisation de isTabActive pour la classe CSS
            className={isTabActive(item.path) ? 'active' : ''}
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </button>
        ))}
        
        {/* Menu admin */}
        {isAuthenticated && hasRole('admin') && adminItems.map(item => (
          <button
            key={item.id}
            // Changement: Utilisation de isTabActive pour la classe CSS
            className={isTabActive(item.path) ? 'active' : ''}
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