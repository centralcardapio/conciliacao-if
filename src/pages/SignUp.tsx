import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validations
            if (!name.trim()) throw new Error('Nome é obrigatório');
            if (!email.trim()) throw new Error('Email é obrigatório');
            if (!validateEmail(email)) throw new Error('Email inválido');
            if (!password) throw new Error('Senha é obrigatória');
            if (password.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres');

            // Create user in Supabase Auth
            // The trigger 'handle_new_user' will automatically create the profile
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        role: 'corporativo' // Forcing Admin role for this initial setup
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                toast({
                    title: "Admin criado com sucesso!",
                    description: "Você já pode fazer login com suas credenciais.",
                    variant: "default",
                });
                // Delay navigation slightly to let toast show
                setTimeout(() => navigate('/login'), 2000);
            }

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro ao criar usuário');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="auth-card animate-fade-in w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Configuração Inicial</h1>
                    <p className="text-muted-foreground mt-2">
                        Crie o primeiro usuário Administrador (Corporativo)
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Administrador do Sistema"
                            className="form-input"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Email Corporativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@empresa.com"
                            className="form-input"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Senha</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="******"
                                className="form-input pr-10"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center justify-center gap-2 w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Criando Admin...</span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                <span>Criar Admin e Acessar</span>
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="link text-sm">
                            Voltar para Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
