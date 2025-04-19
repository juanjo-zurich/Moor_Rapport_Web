import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import moorLogo from '../../assets/logoMoor.png';
import { showNotification } from '../../components/ui/Notifications';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    employee_number: '',
    first_name: '',
    last_name: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validación básica
    if (
      !formData.employee_number.trim() ||
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.contact.trim() ||
      !formData.password.trim()
    ) {
      setFormError('Por favor, complete todos los campos obligatorios');
      showNotification('Por favor, complete todos los campos obligatorios', 'error');
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    // Validar formato de contacto (email o teléfono)
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!emailRegex.test(formData.contact) && !phoneRegex.test(formData.contact)) {
      setFormError('El contacto debe ser un email o número de teléfono válido');
      showNotification('El contacto debe ser un email o número de teléfono válido', 'error');
      return;
    }

    try {
      // Excluir confirmPassword del objeto que se envía al backend
      const { confirmPassword, ...userData } = formData;
      const newUser = await register(userData);
      
      if (newUser) {
        showNotification('¡Usuario registrado exitosamente!', 'success');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setFormError('Error al registrar el usuario');
        showNotification('Error al registrar el usuario', 'error');
      }
    } catch (error) {
      setFormError('Ocurrió un error durante el registro');
      showNotification('Ocurrió un error durante el registro', 'error');
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#FFFBF6] p-8 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-center mb-6">
        <img src={moorLogo} alt="Moor AG Logo" className="h-16" />
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900">Crear Cuenta</h2>
      <p className="text-center text-gray-600 mb-6">Regístrate para comenzar</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Los errores ahora se muestran como notificaciones animadas */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="first_name" className="block text-sm font-medium text-[#1F2937]">Nombre*</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-400"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="last_name" className="block text-sm font-medium text-[#1F2937]">Apellido*</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="employee_number" className="block text-sm font-medium text-[#1F2937]">Número de Empleado*</label>
            <input
              type="text"
              id="employee_number"
              name="employee_number"
              value={formData.employee_number}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-400" />
          </div>

          <div className="space-y-2">
            <label htmlFor="contact" className="block text-sm font-medium text-[#1F2937]">Contacto (Email o Teléfono)*</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#1F2937]">Contraseña*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1F2937]">Confirmar Contraseña*</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-400"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#FFD700] hover:bg-[#F7C948] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] disabled:opacity-50 transition-colors duration-200 mt-6"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;