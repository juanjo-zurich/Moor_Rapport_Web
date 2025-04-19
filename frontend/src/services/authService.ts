import axios from 'axios';

// Configuración base para axios
const API_URL = 'http://localhost:8000/api/v1';

// Interfaz para los datos de usuario
interface UserLogin {
  employee_number: string;
  password: string;
}

interface UserRegister {
  employee_number: string;
  first_name: string;
  last_name: string;
  contact: string;
  image_url?: string;
  password: string;
}

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

interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Clase para manejar la autenticación
class AuthService {
  // Método para iniciar sesión
  async login(credentials: UserLogin): Promise<boolean> {
    try {
      // Adaptamos los datos para el formato que espera el backend (OAuth2)
      const formData = new FormData();
      formData.append('username', credentials.employee_number);
      formData.append('password', credentials.password);

      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/token`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.access_token) {
        // Guardamos el token en localStorage
        localStorage.setItem('token', response.data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error durante el login:', error);
      return false;
    }
  }

  // Método para registrar un nuevo usuario
  async register(userData: UserRegister): Promise<UserData | null> {
    try {
      const response = await axios.post<UserData>(
        `${API_URL}/auth/register`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error('Error durante el registro:', error);
      return null;
    }
  }

  // Método para obtener el perfil del usuario actual
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await axios.get<UserData>(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      return null;
    }
  }

  // Método para actualizar el perfil del usuario actual
  async updateUserProfile(userData: Partial<UserData>): Promise<UserData | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await axios.put<UserData>(
        `${API_URL}/users/me`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      return null;
    }
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
  }

  // Método para obtener el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Exportar una instancia del servicio
const authService = new AuthService();
export default authService;