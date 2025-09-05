
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
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', data.session.user.id)
          .single();
        if (mounted) setProfile((prof as Profile) ?? null);
      }
      setLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', sess.user.id)
          .single();
        setProfile((prof as Profile) ?? null);
      } else {
        setProfile(null);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const role: UserRole = profile?.role ?? (session ? 'client' : devRole ?? null);
  
  // Debug logging
  console.log('Auth Debug:', {
    session: !!session,
    profile,
    role,
    isAuthenticated: !!session?.user || !!devRole,
    userId: session?.user?.id
  });

  const login = async (arg: UserRole | { email: string; password: string }) => {
    if (typeof arg === 'string') {
      localStorage.setItem('userRole', arg);
      window.location.reload();
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
    window.location.reload();
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
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && auth.role !== allowedRole) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export { useAuth };
export type { UserRole };
