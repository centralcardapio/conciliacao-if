import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

// Mock users for testing
const mockUsers = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@loja.com",
    password: "Senha123!",
    role: "loja" as UserRole,
    loja: "Loja Centro",
    empresa: "Rede Supermercados ABC"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@regional.com",
    password: "Senha123!",
    role: "regional" as UserRole,
    regiao: "Região Sul",
    empresa: "Rede Supermercados ABC"
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

  // Helper to fetch profile and update state
  const fetchProfileAndSetUser = async (sessionUser: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist yet (race condition with trigger), fallback to metadata
        setUser({
          id: sessionUser.id, // using string UUID as id now
          name: sessionUser.user_metadata?.name || sessionUser.email,
          email: sessionUser.email,
          role: (sessionUser.user_metadata?.role as UserRole) || 'store',
          // These might be empty initially if not set in profile
          loja: profile?.store_id || undefined,
          regiao: profile?.region_id || undefined
        } as unknown as User); // Temporary cast until we fix User type to accept string ID
        return;
      }

      if (profile) {
        setUser({
          id: profile.id as any, // ID in DB is UUID (string), app expects number currently. We need to fix types.
          name: profile.name,
          email: profile.email,
          role: profile.role,
          loja: profile.store_id || undefined,
          regiao: profile.region_id || undefined
        } as unknown as User);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchProfileAndSetUser(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfileAndSetUser(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : error.message);
    }
    // state update handled by onAuthStateChange
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);
    if (error) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    // Note: Supabase handles token via URL in resetPasswordForEmail flow.
    // Usually you just call updateUser with new password when session is established via the link.
    // For now assuming we are in a simplistic flow or logged in via the link.
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsLoading(false);
    if (error) {
      throw new Error(error.message);
    }
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
