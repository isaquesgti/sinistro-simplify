import React, { useState, useEffect, useContext, createContext } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'; // Importe o cliente Supabase

type UserRole = 'client' | 'insurer' | 'admin' | null;

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erro ao obter sessão:", sessionError.message);
        setSession(null);
        setRole(null);
        setLoading(false);
        return;
      }
      
      if (currentSession) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();
          
        if (userError) {
          console.error('Erro ao buscar o role do usuário:', userError.message);
          setRole(null);
        } else if (userData) {
          setRole(userData.role as UserRole);
        }
      }
      setSession(currentSession);
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_OUT') {
        setRole(null);
      }
      if (_event === 'SIGNED_IN') {
        fetchSession(); // Re-fetch role on successful login
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  const value = {
    role,
    isAuthenticated: !!session && !loading,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
  redirectTo: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRole,
  redirectTo 
}) => {
  const auth = useAuth();
  
  if (auth.loading) {
    return <div>Carregando...</div>; // Adicione um spinner ou tela de carregamento aqui
  }
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (auth.role !== allowedRole) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export { useAuth, AuthProvider };
export type { UserRole };
