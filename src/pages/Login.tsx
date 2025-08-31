// src/components/Login.tsx
// ... (imports)
import { supabase } from '@/lib/supabaseClient'; // Importe o cliente Supabase

const Login = () => {
  // ... (existing state and other code)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });

      if (error) {
        throw error;
      }
      
      // O Supabase lida com o token e a sessão automaticamente
      // A função auth.login() no AccessControl será substituída por uma que verifica o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Obter o role do usuário do banco de dados para redirecionar corretamente
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData) {
          auth.login(userData.role); // Chame a função de login com o role real
          navigate('/dashboard'); // Ou redirecione com base no role
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of the component)
};

export default Login;
