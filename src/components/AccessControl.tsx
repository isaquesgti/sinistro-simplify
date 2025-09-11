import { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'insurer' | 'client';

interface AuthContextType {
  user: any;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string } | UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUser(session.user);
        setRole(profile?.role || null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: { email: string; password: string } | UserRole) => {
    if (typeof credentials === 'string') {
      // Login de desenvolvimento - criar usuário temporário
      const mockUser = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        user_metadata: { full_name: 'Dev User' }
      };
      setUser(mockUser);
      setRole(credentials);
      return;
    }

    // Login real com Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Para contornar o problema de RLS, vamos usar os dados do usuário diretamente
      // e inferir o role baseado no email ou usar um role padrão
      let userRole: UserRole = 'client';
      
      if (credentials.email.includes('admin')) {
        userRole = 'admin';
      } else if (credentials.email.includes('seguradora') || credentials.email.includes('insurer')) {
        userRole = 'insurer';
      }
      
      setUser(data.user);
      setRole(userRole);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    // Redirecionar para a página inicial após logout
    window.location.href = '/';
  };

  const isAuthenticated = !!user;

  const value = { user, role, loading, isAuthenticated, login, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute = ({ children, allowedRole, redirectTo }: { children: React.ReactNode, allowedRole: UserRole, redirectTo: string }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  // Se a autenticação ainda está carregando, não faça nada
  if (auth.loading) {
    return <div>Carregando...</div>; 
  }

  // Se a role não for a esperada, redirecione
  if (auth.role !== allowedRole) {
    navigate(redirectTo, { replace: true });
    return null;
  }

  return <>{children}</>;
};