import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '@/types';

// Mock users for testing
const mockUsers = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@loja.com",
    password: "Senha123!",
    role: "loja" as UserRole,
    loja: "Loja Centro"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@regional.com",
    password: "Senha123!",
    role: "regional" as UserRole,
    regiao: "Região Sul"
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos@corporativo.com",
    password: "Senha123!",
    role: "corporativo" as UserRole,
    empresa: "Rede Supermercados ABC"
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('conciliacao_user');
    const storedToken = localStorage.getItem('conciliacao_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('conciliacao_user');
        localStorage.removeItem('conciliacao_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Email ou senha incorretos');
    }
    
    const { password: _, ...userWithoutPassword } = foundUser;
    const token = `mock-jwt-token-${Date.now()}`;
    
    localStorage.setItem('conciliacao_user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('conciliacao_token', token);
    
    setUser(userWithoutPassword);
    setIsLoading(false);
  };

  const logout = (): void => {
    localStorage.removeItem('conciliacao_user');
    localStorage.removeItem('conciliacao_token');
    setUser(null);
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Email não encontrado no sistema');
    }
    
    // In a real app, this would send an email
    console.log(`Password reset email sent to: ${email}`);
    setIsLoading(false);
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would validate the token and update the password
    if (!token) {
      setIsLoading(false);
      throw new Error('Link expirado. Solicite um novo email de recuperação');
    }
    
    console.log(`Password reset with token: ${token}`);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
