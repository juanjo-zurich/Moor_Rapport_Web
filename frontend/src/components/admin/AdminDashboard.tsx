import React, { useState, useEffect, JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showNotification } from '../ui/Notifications';
import ObrasManagement from './ObrasManagement';

interface User {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  contact: string;
  isAdmin: boolean;
  is_active: boolean;
}

const AdminDashboard = (): JSX.Element | null => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'obras'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    employee_number: '',
    first_name: '',
    last_name: '',
    contact: '',
    password: '',
    isAdmin: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('No estás autenticado', 'error');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/admin/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los usuarios');
      }

      const data = await response.json();
      setUsers(data);
    } catch {
      showNotification('Error al cargar los usuarios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('No estás autenticado', 'error');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/admin/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear el usuario');
      }

      showNotification('Usuario creado exitosamente', 'success');
      setNewUser({
        employee_number: '',
        first_name: '',
        last_name: '',
        contact: '',
        password: '',
        isAdmin: false
      });
      fetchUsers();
    } catch (error) {
      const err = error as Error;
      showNotification(err.message || 'Error al crear el usuario', 'error');
    }
  };

  if (!user?.isAdmin) {
    showNotification('Acceso denegado. No tiene permisos de administrador.', 'error');
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
            <p className="text-purple-200">Gestión de usuarios y obras</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all"
          >
            Volver al Inicio
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-xl font-bold">{user?.first_name?.[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{user?.first_name} {user?.last_name}</h3>
                  <p className="text-sm text-purple-200">Administrador</p>
                </div>
              </div>
              <nav>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition-all ${
                    activeTab === 'users' 
                      ? 'bg-white bg-opacity-20' 
                      : 'hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Usuarios
                </button>
                <button
                  onClick={() => setActiveTab('obras')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'obras' 
                      ? 'bg-white bg-opacity-20' 
                      : 'hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Obras
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {activeTab === 'users' ? (
              <div className="space-y-6">
                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
                    <h3 className="text-white text-lg font-semibold mb-2">Total Usuarios</h3>
                    <p className="text-3xl font-bold text-white">{users.length}</p>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
                    <h3 className="text-white text-lg font-semibold mb-2">Administradores</h3>
                    <p className="text-3xl font-bold text-white">
                      {users.filter(u => u.isAdmin).length}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
                    <h3 className="text-white text-lg font-semibold mb-2">Usuarios Activos</h3>
                    <p className="text-3xl font-bold text-white">
                      {users.filter(u => u.is_active).length}
                    </p>
                  </div>
                </div>

                {/* Create User Form */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Crear Nuevo Usuario</h2>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="employee_number" className="block text-sm font-medium text-purple-200 mb-2">
                        Número de Empleado
                      </label>
                      <input
                        type="text"
                        id="employee_number"
                        value={newUser.employee_number}
                        onChange={(e) => setNewUser({ ...newUser, employee_number: e.target.value })}
                        className="w-full bg-white bg-opacity-20 border-0 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-purple-200 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        value={newUser.first_name}
                        onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                        className="w-full bg-white bg-opacity-20 border-0 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-purple-200 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        value={newUser.last_name}
                        onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                        className="w-full bg-white bg-opacity-20 border-0 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-purple-200 mb-2">
                        Contacto
                      </label>
                      <input
                        type="text"
                        id="contact"
                        value={newUser.contact}
                        onChange={(e) => setNewUser({ ...newUser, contact: e.target.value })}
                        className="w-full bg-white bg-opacity-20 border-0 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full bg-white bg-opacity-20 border-0 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAdmin"
                        checked={newUser.isAdmin}
                        onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-400 border-purple-300 rounded"
                      />
                      <label htmlFor="isAdmin" className="ml-2 block text-sm text-purple-200">
                        Es Administrador
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                      >
                        Crear Usuario
                      </button>
                    </div>
                  </form>
                </div>

                {/* Users Table */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-white border-opacity-10">
                    <h2 className="text-xl font-semibold text-white">Usuarios Existentes</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white divide-opacity-10">
                      <thead>
                        <tr className="bg-white bg-opacity-5">
                          <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                            Número de Empleado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                            Contacto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                            Rol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white divide-opacity-10">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-white hover:bg-opacity-5">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {user.employee_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {user.first_name} {user.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {user.contact}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isAdmin 
                                  ? 'bg-purple-500 text-white' 
                                  : 'bg-blue-500 text-white'
                              }`}>
                                {user.isAdmin ? 'Administrador' : 'Usuario'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                user.is_active 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white'
                              }`}>
                                {user.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <ObrasManagement />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;