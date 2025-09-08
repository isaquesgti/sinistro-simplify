
import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'client' | 'insurer' | 'admin' | null;

type Profile = {
  id: string;
  role: Exclude<UserRole, null> | null;
};

const useAuth = () => {
  const [session, setSession] = React.useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const devRole = React.useMemo(() => localStorage.getItem('userRole') as UserRole, []);

  React.useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener first
    const { data: subscription } = supabase.auth.onAuthStateChange((event, sess) => {
      if (!mounted) return;
      
      setSession(sess);
      
      if (sess?.user) {
        // Use setTimeout to prevent auth state callback deadlock
        setTimeout(() => {
          supabase
            .from('profiles')
            .select('id, role')
            .eq('id', sess.user.id)
            .single()
            .then(({ data: prof }) => {
              if (mounted) {
                setProfile((prof as Profile) ?? null);
                setLoading(false);
              }
            });
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      
      setSession(data.session);
      
      if (data.session?.user) {
        supabase
          .from('profiles')
          .select('id, role')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data: prof }) => {
            if (mounted) {
              setProfile((prof as Profile) ?? null);
              setLoading(false);
            }
          });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const role: UserRole = profile?.role ?? (devRole ?? null);

  const login = async (arg: UserRole | { email: string; password: string }) => {
    if (typeof arg === 'string') {
      localStorage.setItem('userRole', arg);
      // Force role update without page reload
      setProfile({ id: 'dev-user', role: arg });
      return;
    }
    const { email, password } = arg;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // profile will be fetched via onAuthStateChange
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    setProfile(null);
    setSession(null);
  };

  return {
    role,
    isAuthenticated: !!session?.user || !!devRole,
    user: session?.user ?? null,
    profile,
    loading,
    login,
    logout,
  };
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
    return <div>Loading...</div>;
  }
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && auth.role !== allowedRole) {
    // Prevent circular redirects by checking the current path
    const currentPath = window.location.pathname;
    if (currentPath !== redirectTo && currentPath !== '/login') {
      return <Navigate to={redirectTo} replace />;
    }
    // If we're already on the redirect path or login, show access denied instead
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <Navigate to="/login" replace />
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export { useAuth };
export type { UserRole };
