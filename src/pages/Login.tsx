import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email.trim()) {
      setError('Por favor, insira seu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    if (!password) {
      setError('Por favor, insira sua senha');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao fazer login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="auth-card animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Conciliação</h1>
          <p className="text-muted-foreground mt-2">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="form-input"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input pr-10"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link to="/forgot-password" className="link text-sm">
              Esqueci minha senha
            </Link>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 p-4 bg-secondary rounded-md">
          <p className="text-xs font-medium text-muted-foreground mb-2">Credenciais de teste:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><strong>Loja:</strong> joao@loja.com / Senha123!</p>
            <p><strong>Regional:</strong> maria@regional.com / Senha123!</p>
            <p><strong>Corporativo:</strong> carlos@corporativo.com / Senha123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
