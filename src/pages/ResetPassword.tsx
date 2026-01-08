import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuth();
  
  const token = searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (password: string): { level: string; label: string } => {
    if (password.length === 0) return { level: '', label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', label: 'Fraca' };
    if (strength === 3) return { level: 'fair', label: 'Razoável' };
    if (strength === 4) return { level: 'good', label: 'Boa' };
    return { level: 'strong', label: 'Forte' };
  };

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    
    return hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Por favor, insira a nova senha');
      return;
    }

    if (!validatePassword(password)) {
      setError('A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao redefinir a senha');
      }
    }
  };

  const passwordStrength = getPasswordStrength(password);

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="auth-card animate-fade-in text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Senha redefinida!</h2>
          <p className="text-muted-foreground mb-6">
            Sua senha foi alterada com sucesso.
            Redirecionando para o login...
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="auth-card animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Conciliação</h1>
          <p className="text-muted-foreground mt-2">
            Criar nova senha
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

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Nova Senha
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
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1">
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className={`password-strength password-strength-${passwordStrength.level}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Força da senha: <span className="font-medium">{passwordStrength.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input pr-10"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">As senhas não conferem</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="p-3 bg-secondary rounded-md">
            <p className="text-xs font-medium text-muted-foreground mb-2">A senha deve conter:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className={password.length >= 8 ? 'text-success' : ''}>• Mínimo 8 caracteres</li>
              <li className={/[a-z]/.test(password) ? 'text-success' : ''}>• Uma letra minúscula</li>
              <li className={/[A-Z]/.test(password) ? 'text-success' : ''}>• Uma letra maiúscula</li>
              <li className={/[0-9]/.test(password) ? 'text-success' : ''}>• Um número</li>
              <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-success' : ''}>• Um caractere especial (!@#$%...)</li>
            </ul>
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
                <span>Redefinindo...</span>
              </>
            ) : (
              <span>Redefinir Senha</span>
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <Link to="/login" className="link text-sm inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
