import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { showNotification } from '../ui/Notifications';

interface User {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  contact: string;
  image_url?: string;
  is_active: boolean;
  isAdmin: boolean;
}

interface UserFormData {
  employee_number: string;
  first_name: string;
  last_name: string;
  contact: string;
  image_url?: string;
  // Añadir campo de contraseña para la creación
  password?: string;
  isAdmin?: boolean; // Añadir campo para rol
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false); // Estado para controlar el modo creación
  const [formData, setFormData] = useState<UserFormData>({
    employee_number: '',
    first_name: '',
    last_name: '',
    contact: '',
    image_url: '',
    password: '', // Inicializar contraseña
    isAdmin: false // Inicializar rol
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<User[]>('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      showNotification('Error al cargar la lista de usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Manejar checkbox para isAdmin
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsCreating(false); // Asegurarse de que no estamos en modo creación
    setFormData({
      employee_number: user.employee_number,
      first_name: user.first_name,
      last_name: user.last_name,
      contact: user.contact,
      image_url: user.image_url || '',
      password: '', // No precargar contraseña en edición
      isAdmin: user.isAdmin // Cargar rol actual
    });
  };

  // Función para iniciar la creación de usuario
  const handleCreate = () => {
    setEditingUser(null);
    setIsCreating(true);
    setFormData({ // Resetear formulario para creación
      employee_number: '',
      first_name: '',
      last_name: '',
      contact: '',
      image_url: '',
      password: '',
      isAdmin: false
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setIsCreating(false);
    setFormData({ // Resetear formulario
      employee_number: '',
      first_name: '',
      last_name: '',
      contact: '',
      image_url: '',
      password: '',
      isAdmin: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar contraseña en creación
    if (isCreating && !formData.password) {
        showNotification('La contraseña es obligatoria para crear un usuario.', 'error');
        return;
    }

    // Crear copia de formData sin el campo password si no se está creando o si está vacío en edición
    const dataToSend: Partial<UserFormData> = { ...formData };
    if (!isCreating && !formData.password) {
        delete dataToSend.password;
    }

    try {
      if (isCreating) {
        // Lógica para crear usuario (POST)
        await apiService.post('/admin/users', dataToSend);
        showNotification('Usuario creado correctamente', 'success');
      } else if (editingUser) {
        // Lógica para actualizar usuario (PUT)
        await apiService.put(`/admin/users/${editingUser.id}`, dataToSend);
        showNotification('Usuario actualizado correctamente', 'success');
      }
      fetchUsers(); // Recargar la lista
      handleCancel(); // Resetear formulario y estado
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      const errorMessage = error.response?.data?.detail || (isCreating ? 'Error al crear usuario' : 'Error al actualizar usuario');
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    try {
      await apiService.delete(`/admin/users/${userId}`);
      showNotification('Usuario eliminado correctamente', 'success');
      fetchUsers(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showNotification('Error al eliminar usuario', 'error');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
        {/* Botón para abrir el formulario de creación */}
        <Button onClick={handleCreate} variant="primary" size="sm">
          Crear Usuario
        </Button>
      </div>

      {/* Formulario de creación/edición */}
      {(editingUser || isCreating) && (
        <Card className="mb-6 p-4">
          <h3 className="text-lg font-medium mb-3">
            {isCreating ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Empleado</label>
                <input
                  type="text"
                  name="employee_number"
                  value={formData.employee_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {/* Campo de contraseña, requerido solo en creación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  // Solo requerido en creación
                  required={isCreating}
                  placeholder={isCreating ? 'Requerido' : 'Dejar en blanco para no cambiar'}
                />
              </div>
              {/* Checkbox para rol de administrador */}
              <div className="flex items-center">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  checked={formData.isAdmin || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#FFD700] focus:ring-[#FFB800] border-gray-300 rounded"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                  Es Administrador
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={handleCancel}>Cancelar</Button>
              <Button type="submit" variant="primary">
                {isCreating ? 'Crear Usuario' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabla de usuarios */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.employee_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.first_name} {user.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.contact}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.isAdmin ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      onClick={() => handleEdit(user)}
                      variant="outline"
                      size="sm"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {users.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          No hay usuarios registrados
        </div>
      )}
    </div>
  );
};

export default UserManagement;