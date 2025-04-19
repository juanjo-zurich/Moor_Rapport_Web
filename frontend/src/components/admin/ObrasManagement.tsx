import React, { useState, useEffect } from 'react';
import { showNotification } from '../ui/Notifications';

interface Work {
  id: number;
  work_number: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  user_id: number;
}

const ObrasManagement: React.FC = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [newWork, setNewWork] = useState({
    work_number: '',
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('No estás autenticado', 'error');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/admin/obras', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar las obras');
      }

      const data = await response.json();
      setWorks(data);
    } catch {
      showNotification('Error al cargar las obras', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('No estás autenticado', 'error');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/admin/obras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newWork),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la obra');
      }

      showNotification('Obra creada exitosamente', 'success');
      setNewWork({
        work_number: '',
        title: '',
        description: '',
      });
      fetchWorks();
    } catch (error) {
      const err = error as Error;
      showNotification(err.message || 'Error al crear la obra', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">Cargando obras...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Work Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-2">Total Obras</h3>
          <p className="text-3xl font-bold text-white">{works.length}</p>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-2">Obras Activas</h3>
          <p className="text-3xl font-bold text-white">
            {works.filter(w => w.status?.toLowerCase() === 'active').length}
          </p>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-2">Obras Completadas</h3>
          <p className="text-3xl font-bold text-white">
            {works.filter(w => w.status?.toLowerCase() === 'completed').length}
          </p>
        </div>
      </div>

      {/* Create Work Form */}
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Crear Nueva Obra</h2>
        <form onSubmit={handleCreateWork} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="work_number" className="block text-sm font-medium text-purple-200 mb-2">
              Número de Obra
            </label>
            <input
              type="text"
              id="work_number"
              value={newWork.work_number}
              onChange={(e) => setNewWork({ ...newWork, work_number: e.target.value })}
              className="w-full bg-white bg-opacity-20 border-0 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-purple-200 mb-2">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={newWork.title}
              onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
              className="w-full bg-white bg-opacity-20 border-0 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-purple-200 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={newWork.description}
              onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
              className="w-full bg-white bg-opacity-20 border-0 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 h-32 resize-none"
              required
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
            >
              Crear Obra
            </button>
          </div>
        </form>
      </div>

      {/* Works Table */}
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white border-opacity-10">
          <h2 className="text-xl font-semibold text-white">Obras Existentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white divide-opacity-10">
            <thead>
              <tr className="bg-white bg-opacity-5">
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                  Número de Obra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                  Última Actualización
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white divide-opacity-10">
              {works.map((work) => (
                <tr key={work.id} className="hover:bg-white hover:bg-opacity-5">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {work.work_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {work.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(work.status)}`}>
                      {work.status.charAt(0).toUpperCase() + work.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(work.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {work.updated_at ? new Date(work.updated_at).toLocaleDateString() : '-'}
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

export default ObrasManagement;