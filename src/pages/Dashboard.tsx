import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Pedidos Conciliados',
      value: '1.247',
      icon: CheckCircle2,
      change: '+8,3%',
      changeType: 'positive' as const,
      description: 'vs mês anterior',
    },
    {
      title: 'Pedidos Pendentes',
      value: '23',
      icon: Clock,
      change: '-12',
      changeType: 'positive' as const,
      description: 'vs ontem',
    },
    {
      title: 'Divergências',
      value: '15',
      icon: AlertCircle,
      change: '+3',
      changeType: 'negative' as const,
      description: 'aguardando análise',
    },
    {
      title: 'Tarefas Abertas',
      value: '8',
      icon: ClipboardList,
      change: '5 cancelar, 3 contestar',
      changeType: 'neutral' as const,
      description: '',
    },
  ];

  const financialStats = [
    {
      title: 'Volume Conciliado',
      value: 'R$ 458.932,00',
      icon: TrendingUp,
      change: '+15,2%',
      changeType: 'positive' as const,
    },
    {
      title: 'Valor em Divergência',
      value: 'R$ 3.245,80',
      icon: TrendingDown,
      change: '0,7% do total',
      changeType: 'neutral' as const,
    },
  ];

  const operationalStats = [
    {
      title: 'Lojas Ativas',
      value: user?.role === 'corporativo' ? '156' : user?.role === 'regional' ? '24' : '1',
      icon: Store,
    },
    {
      title: 'Última Atualização iFood',
      value: 'Há 2 horas',
      icon: RefreshCw,
    },
    {
      title: 'Uploads Hoje',
      value: '12',
      icon: Package,
    },
  ];

  const getChangeColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Visão geral das conciliações e indicadores do sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={stat.title}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className={`text-sm mt-2 ${getChangeColor(stat.changeType)}`}>
                {stat.change} {stat.description && <span className="text-muted-foreground">{stat.description}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financialStats.map((stat, index) => (
            <div 
              key={stat.title}
              className="bg-card border border-border rounded-xl p-6 animate-fade-in"
              style={{ animationDelay: `${(index + 4) * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Operational Stats */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Informações Operacionais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {operationalStats.map((stat) => (
              <div key={stat.title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
