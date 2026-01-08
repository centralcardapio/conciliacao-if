import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';

const Home: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'loja': return 'Loja';
      case 'regional': return 'Regional';
      case 'corporativo': return 'Corporativo';
      default: return '';
    }
  };

  return (
    <Layout title="Home">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground">
          {getGreeting()}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-lg text-muted-foreground mt-3 max-w-md">
          Bem-vindo ao Conciliação. Use o menu lateral para navegar.
        </p>
        <div className="mt-6 px-4 py-2 bg-secondary rounded-full">
          <span className="text-sm text-muted-foreground">
            Perfil: <span className="font-medium text-foreground">{getRoleLabel()}</span>
          </span>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
