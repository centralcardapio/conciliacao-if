export type UserRole = 'store' | 'regional' | 'corporate';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  loja?: string;
  regiao?: string;
  empresa?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}
