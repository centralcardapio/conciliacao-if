import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Users, 
  TrendingUp, 
  Clock 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getRoleGreeting = () => {
    switch (user?.role) {
      case 'loja':
        return `Loja ${user.loja || ''}`;
      case 'regional':
        return `Regional ${user.regiao || ''}`;
      case 'corporativo':
        return user.empresa || 'Corporativo';
      default:
        return '';
    }
  };

  const stats = [
    {
      title: 'Vendas do Dia',
      value: 'R$ 45.678',
      icon: TrendingUp,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Pedidos Pendentes',
      value: '23',
      icon: Package,
      change: '-5',
      changeType: 'negative' as const,
    },
    {
      title: 'Lojas Ativas',
      value: user?.role === 'corporativo' ? '156' : user?.role === 'regional' ? '24' : '1',
      icon: Store,
      change: user?.role === 'corporativo' ? '+3' : undefined,
      changeType: 'positive' as const,
    },
    {
      title: 'Última Atualização',
      value: 'Há 5 min',
      icon: Clock,
    },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {getRoleGreeting()} • {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={stat.title}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.change} vs ontem
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user?.role === 'corporativo' && (
              <>
                <button className="btn-secondary flex items-center justify-center gap-2 py-4">
                  <Users className="w-5 h-5" />
                  <span>Gestão Usuários</span>
                </button>
                <button className="btn-secondary flex items-center justify-center gap-2 py-4">
                  <Store className="w-5 h-5" />
                  <span>Gestão Lojas</span>
                </button>
              </>
            )}
            <button className="btn-secondary flex items-center justify-center gap-2 py-4">
              <Package className="w-5 h-5" />
              <span>Base Pedidos</span>
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2 py-4">
              <LayoutDashboard className="w-5 h-5" />
              <span>Relatórios</span>
            </button>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-4">Atividade Recente</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-4 bg-secondary rounded-md"
              >
                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Conciliação #{1000 + i} processada
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Há {i * 15} minutos • {i === 1 ? 'Loja Centro' : i === 2 ? 'Loja Norte' : 'Loja Sul'}
                  </p>
                </div>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">
                  Concluído
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
