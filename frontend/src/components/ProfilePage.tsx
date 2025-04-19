import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface UserData {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  contact: string;
  image_url?: string;
  is_active: boolean;
  isAdmin: boolean;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [editData, setEditData] = useState<Partial<UserData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setEditData({
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
          contact: currentUser.contact,
          image_url: currentUser.image_url,
        });
      } else {
        setError('No se pudo cargar la información del usuario.');
        // Redirigir al login si no hay usuario
        navigate('/login');
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!user) return;

    const updatedUser = await authService.updateUserProfile(editData);
    if (updatedUser) {
      setUser(updatedUser);
      setSuccess('Perfil actualizado correctamente.');
    } else {
      setError('Error al actualizar el perfil.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!user) {
    // Esto no debería pasar si la lógica de useEffect es correcta, pero por si acaso
    return <div className="container mx-auto p-4">Usuario no encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employee_number">
            Número de Empleado
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
            id="employee_number"
            type="text"
            value={user.employee_number}
            disabled // No editable
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
            Nombre
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="first_name"
            type="text"
            name="first_name"
            value={editData.first_name || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
            Apellido
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="last_name"
            type="text"
            name="last_name"
            value={editData.last_name || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact">
            Contacto (Email/Teléfono)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contact"
            type="text"
            name="contact"
            value={editData.contact || ''}
            onChange={handleInputChange}
          />
        </div>
        {/* Podrías añadir un campo para image_url si quieres permitir cambiarla */}
        {/* <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image_url">
            URL de Imagen (Opcional)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="image_url"
            type="text"
            name="image_url"
            value={editData.image_url || ''}
            onChange={handleInputChange}
          />
        </div> */}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Guardar Cambios
          </button>
        </div>
      </form>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default ProfilePage;