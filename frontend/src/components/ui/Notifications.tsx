import React from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiCheck, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

// Tipos de notificaciones disponibles
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Opciones por defecto para las notificaciones
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Función para mostrar notificaciones con iconos
export const showNotification = (message: string, type: NotificationType = 'info', options?: ToastOptions) => {
  const toastOptions = { ...defaultOptions, ...options };
  
  // Configurar el icono según el tipo de notificación
  const Icon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="text-lg mr-2" />;
      case 'error':
        return <FiAlertCircle className="text-lg mr-2" />;
      case 'warning':
        return <FiAlertCircle className="text-lg mr-2" />;
      case 'info':
      default:
        return <FiInfo className="text-lg mr-2" />;
    }
  };

  // Contenido personalizado con icono
  const content = (
    <div className="flex items-center">
      <Icon />
      <span>{message}</span>
    </div>
  );

  // Mostrar la notificación según el tipo
  switch (type) {
    case 'success':
      toast.success(content, toastOptions);
      break;
    case 'error':
      toast.error(content, toastOptions);
      break;
    case 'warning':
      toast.warning(content, toastOptions);
      break;
    case 'info':
    default:
      toast.info(content, toastOptions);
      break;
  }
};

// Componente contenedor para las notificaciones
const Notifications: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      closeButton={({ closeToast }) => (
        <button onClick={closeToast} className="text-gray-500 hover:text-gray-700">
          <FiX size={18} />
        </button>
      )}
    />
  );
};

export default Notifications;