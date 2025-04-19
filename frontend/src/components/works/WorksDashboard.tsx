import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showNotification } from '../ui/Notifications';
import { useNavigate } from 'react-router-dom';

interface Work {
  id: number;
  work_number: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface ApiError {
  message: string;
  detail?: string;
}

const WorksDashboard = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [newWork, setNewWork] = useState({
    work_number: '',
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('No estás autenticado', 'error');
        logout();
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/obras/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        showNotification('Tu sesión ha expirado', 'error');
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail || 'Error al cargar las obras');
      }

      const data = await response.json();
      setWorks(data);
    } catch (error) {
      const err = error as Error;
      showNotification(err.message || 'Error al cargar las obras', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('No estás autenticado', 'error');
      logout();
      navigate('/login');
      return;
    }

    // Verificar si el número de obra ya existe
    const workExists = works.some(work => work.work_number === newWork.work_number);
    if (workExists) {
      showNotification('El número de obra ya existe', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/obras/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newWork),
      });

      if (response.status === 401) {
        showNotification('Tu sesión ha expirado', 'error');
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail || 'Error al crear la obra');
      }

      showNotification('Obra creada exitosamente', 'success');
      setNewWork({ work_number: '', title: '', description: '' });
      fetchWorks();
    } catch (error) {
      const err = error as Error;
      showNotification(err.message || 'Error al crear la obra', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando obras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Obras</h1>
        <p className="mt-2 text-sm text-gray-700">
          Gestiona y crea nuevas obras
        </p>
      </div>

      {/* Formulario para crear nueva obra */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Crear Nueva Obra</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="work_number" className="block text-sm font-medium text-gray-700">
              Número de Obra
            </label>
            <input
              type="text"
              id="work_number"
              value={newWork.work_number}
              onChange={(e) => setNewWork({ ...newWork, work_number: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring-[#FFD700] sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={newWork.title}
              onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring-[#FFD700] sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              value={newWork.description}
              onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring-[#FFD700] sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FFD700] hover:bg-[#FFC000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
          >
            Crear Obra
          </button>
        </form>
      </div>

      {/* Lista de obras existentes */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Obras Existentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número de Obra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {works.map((work) => (
                <tr key={work.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {work.work_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {work.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      work.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {work.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(work.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorksDashboard; 