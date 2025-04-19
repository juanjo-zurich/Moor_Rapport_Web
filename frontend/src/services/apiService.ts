import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import authService from './authService';

// Configuración base para axios
const API_URL = 'http://localhost:8000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Crear instancia de axios con configuración base
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para añadir el token a las peticiones
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Si recibimos un 401 (Unauthorized), cerramos sesión
        if (error.response && error.response.status === 401) {
          authService.logout();
          // Aquí podrías redirigir al login si usas un router
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos genéricos para realizar peticiones
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

// Exportamos una instancia única del servicio
export default new ApiService();