import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showNotification } from '../ui/Notifications';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

interface LoginFormProps {
  onSuccess?: () => void; // Mantener por si se usa en otro lugar, pero la redirección se hará aquí
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, error, loading } = useAuth();
  const navigate = useNavigate(); // Obtener la función navigate
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validación básica
    if (!employeeNumber.trim() || !password.trim()) {
      setFormError('Por favor, complete todos los campos');
      showNotification('Por favor, complete todos los campos', 'error');
      return;
    }

    const success = await login(employeeNumber, password);
    if (success) {
      showNotification('¡Inicio de sesión exitoso!', 'success');
      navigate('/profile'); // Redirigir a /profile
      // Ya no llamamos a onSuccess aquí para la redirección
      // if (onSuccess) {
      //   onSuccess();
      // }
    } else {
      showNotification('Error al iniciar sesión. Verifique sus credenciales.', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#FFFBF6] p-8 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-center mb-6">
        {/* <img src="/moor_logo.png" alt="Moor AG Logo" className="h-16" /> */}
        {/* Logo commented out as moor_logo.png is missing */}
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-center text-[#1F2937]">Iniciar Sesión</h2>
      <p className="text-center text-gray-600 mb-6">Ingresa tus credenciales para continuar</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Los errores ahora se muestran como notificaciones animadas */}

        <div className="space-y-2">
          <label htmlFor="employeeNumber" className="block text-sm font-medium text-[#1F2937]">Número de Empleado</label>
          <input
            type="text"
            id="employeeNumber"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-[#1F2937]">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-400"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#FFD700] hover:bg-[#F7C948] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;