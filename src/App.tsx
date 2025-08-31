import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import InsurerDashboard from "./pages/InsurerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ClaimDetails from "./pages/ClaimDetails";
import InsurerClaimDetails from "./pages/InsurerClaimDetails";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/AccessControl";
import { Home, Info, Phone } from "lucide-react";

// Componente Sobre
const Sobre = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <Home className="w-6 h-6" />
            <span>Home</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/sobre" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              <Info className="w-6 h-6" />
            </Link>
            <Link to="/contatos" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              <Phone className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </nav>
      <div className="mt-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Sobre Nós
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Somos uma empresa dedicada a fornecer as melhores soluções para gerenciar sinistros de seguros de forma eficiente e transparente. Nossa missão é simplificar o processo tanto para clientes quanto para seguradoras, garantindo um serviço rápido e confiável.
        </p>
      </div>
    </div>
  );
};

// Componente Contatos
const Contatos = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <Home className="w-6 h-6" />
            <span>Home</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/sobre" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              <Info className="w-6 h-6" />
            </Link>
            <Link to="/contatos" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              <Phone className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </nav>
      <div className="mt-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Contatos
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Entre em contato conosco para mais informações.
        </p>
        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Phone className="w-6 h-6 text-blue-500" />
            <span>(11) 9999-9999</span>
          </div>
          <div className="flex items-center space-x-2">
            <Info className="w-6 h-6 text-blue-500" />
            <span>contato@nossaempresa.com.br</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="client" redirectTo="/insurer">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/insurer" element={
            <ProtectedRoute allowedRole="insurer" redirectTo="/dashboard">
              <InsurerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin" redirectTo="/dashboard">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/claim/:id" element={<ClaimDetails />} />
          <Route path="/insurer/claim/:id" element={
            <ProtectedRoute allowedRole="insurer" redirectTo="/dashboard">
              <InsurerClaimDetails />
            </ProtectedRoute>
          } />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contatos" element={<Contatos />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
