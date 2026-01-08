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

  return (
    <Layout title="Home">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground">
          {getGreeting()}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-lg text-muted-foreground mt-3">
          Bem-vindo ao Conciliação. Use o menu lateral para navegar.
        </p>
      </div>
    </Layout>
  );
};

export default Home;
