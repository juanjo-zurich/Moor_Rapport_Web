import React, { createContext, useContext, useState, useEffect } from 'react';
import { showNotification } from '../components/ui/Notifications';

interface User {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  contact: string;
  isAdmin: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (employee_number: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/v1/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (employee_number: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', employee_number);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/api/v1/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);

      // Obtener datos del usuario
      const userResponse = await fetch('http://localhost:8000/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario');
      }

      const userData = await userResponse.json();
      setUser(userData);
      setIsAuthenticated(true);
      showNotification('Inicio de sesión exitoso', 'success');
    } catch (error) {
      const err = error as Error;
      showNotification(err.message || 'Error al iniciar sesión', 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    showNotification('Sesión cerrada exitosamente', 'success');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};