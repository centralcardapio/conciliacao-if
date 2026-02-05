import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Regionais from "./pages/Regionais";
import Lojas from "./pages/Lojas";
import Usuarios from "./pages/Usuarios";
import UploadVendas from "./pages/UploadVendas";
import HistoricoUploads from "./pages/HistoricoUploads";
import DetalheUpload from "./pages/DetalheUpload";
import GestaoCredenciaisIfood from "./pages/GestaoCredenciaisIfood";
import ConfigurarParametros from "./pages/ConfigurarParametros";
import BasePedidos from "./pages/BasePedidos";
import AtualizacaoIfood from "./pages/AtualizacaoIfood";
import DetalheAtualizacaoIfood from "./pages/DetalheAtualizacaoIfood";
import Tarefas from "./pages/Tarefas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/base-pedidos" element={
              <ProtectedRoute>
                <BasePedidos />
              </ProtectedRoute>
            } />
            <Route path="/regionais" element={
              <ProtectedRoute>
                <Regionais />
              </ProtectedRoute>
            } />
            <Route path="/lojas" element={
              <ProtectedRoute>
                <Lojas />
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            } />
            <Route path="/credenciais-ifood" element={
              <ProtectedRoute>
                <GestaoCredenciaisIfood />
              </ProtectedRoute>
            } />
            <Route path="/configurar-parametros" element={
              <ProtectedRoute>
                <ConfigurarParametros />
              </ProtectedRoute>
            } />
            <Route path="/upload-vendas" element={
              <ProtectedRoute>
                <UploadVendas />
              </ProtectedRoute>
            } />
            <Route path="/historico-uploads" element={
              <ProtectedRoute>
                <HistoricoUploads />
              </ProtectedRoute>
            } />
            <Route path="/historico-uploads/:id" element={
              <ProtectedRoute>
                <DetalheUpload />
              </ProtectedRoute>
            } />
            <Route path="/historico-ifood" element={
              <ProtectedRoute>
                <AtualizacaoIfood />
              </ProtectedRoute>
            } />
            <Route path="/historico-ifood/:id" element={
              <ProtectedRoute>
                <DetalheAtualizacaoIfood />
              </ProtectedRoute>
            } />
            <Route path="/tarefas" element={
              <ProtectedRoute>
                <Tarefas />
              </ProtectedRoute>
            } />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
