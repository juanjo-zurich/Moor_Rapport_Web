export interface User {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  contact: string;
  isAdmin: boolean;
  is_active: boolean;
}

export interface LoginData {
  employee_number: string;
  password: string;
}

export interface RegisterData {
  employee_number: string;
  first_name: string;
  last_name: string;
  contact: string;
  password: string;
  isAdmin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
} 