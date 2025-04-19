import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'; // Añadir Link
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AdminDashboard from './components/admin/AdminDashboard';
import ProfilePage from './components/ProfilePage'; // Importar ProfilePage
import WorksDashboard from './components/works/WorksDashboard';
import Notifications, { showNotification } from './components/ui/Notifications';
import 'react-toastify/dist/ReactToastify.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    // Mostrar un indicador de carga más atractivo
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Mostrar notificación al redirigir
    showNotification('Debe iniciar sesión para acceder', 'info');
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Página de inicio
const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    showNotification('Has cerrado sesión correctamente', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Bienvenido a Moor Rapport</h1>
      {user && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Información del Usuario</h2>
          <div className="space-y-3">
            <p className="text-gray-700"><span className="font-medium">Nombre:</span> {user.first_name} {user.last_name}</p>
            <p className="text-gray-700"><span className="font-medium">Número de Empleado:</span> {user.employee_number}</p>
            <p className="text-gray-700"><span className="font-medium">Contacto:</span> {user.contact}</p>
            {user.isAdmin && (
              <p className="text-gray-700">
                <span className="font-medium">Rol:</span>
                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                  Administrador
                </span>
              </p>
            )}
          </div>
          <div className="mt-6 flex space-x-4">
            {user.isAdmin ? (
              <Link
                to='/admin'
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Panel de Administración
              </Link>
            ) : (
              <Link
                to='/works'
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FFD700] hover:bg-[#FFC000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
              >
                Dashboard de Obras
              </Link>
            )}
            <Link
              to='/profile'
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Mi Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// Página de autenticación
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  
  // Si el usuario ya está autenticado, redirigir a la página principal
  if (user) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="max-w-2xl mx-auto bg-[#F3F4F6] rounded-lg overflow-hidden mt-10">
      <div className="flex bg-white">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${isLogin ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500 hover:text-[#FFD700]'}`}
          onClick={() => setIsLogin(true)}
        >
          Iniciar Sesión
        </button>
       <button
          className={`flex-1 py-3 px-4 text-center font-medium ${!isLogin ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-500 hover:text-[#FFD700]'}`}
          onClick={() => setIsLogin(false)}
        >
          Registrarse
        </button>
      </div>
      <div className="p-6">
        {isLogin ? (
          <LoginForm onSuccess={() => {}} />
        ) : (
          <RegisterForm onSuccess={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
          <Notifications />
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/works" element={<ProtectedRoute><WorksDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}


export default App
