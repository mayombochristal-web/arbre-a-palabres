import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }

    setLoading(false);
  }, []);

  // Connexion
  const login = async (email, password) => {
    try {
      setLoading(true);

      // Simulation de connexion - À remplacer par votre logique d'authentification
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Ceci est une simulation - en production, faites un appel API réel
          if (email === 'admin@arbre-palabres.ga' && password === 'Admin123!') {
            resolve({
              data: {
                success: true,
                token: 'simulated_jwt_token',
                user: {
                  id: 1,
                  name: 'Administrateur',
                  email: 'admin@arbre-palabres.ga',
                  role: 'admin'
                }
              }
            });
          } else {
            resolve({
              data: {
                success: false,
                error: 'Email ou mot de passe incorrect'
              }
            });
          }
        }, 1000);
      });

      if (response.data.success) {
        const { token, user } = response.data;

        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Vérifier les permissions
  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;