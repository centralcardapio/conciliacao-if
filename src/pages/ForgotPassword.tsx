import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, insira seu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao enviar o email');
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="auth-card animate-fade-in text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Email enviado!</h2>
          <p className="text-muted-foreground mb-6">
            Enviamos um link de recuperação para <strong>{email}</strong>.
            Verifique sua caixa de entrada.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar para login
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
            Recuperar sua senha
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

          <p className="text-sm text-muted-foreground">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>

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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <span>Enviar</span>
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

export default ForgotPassword;
