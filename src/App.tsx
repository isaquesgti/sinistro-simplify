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
import Sobre from "./pages/sobre";
import Contatos from "./pages/contatos";
import { ProtectedRoute } from "./components/AccessControl";
import { Home, Info, Phone } from "lucide-react";

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
