import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { 
  Store, 
  Upload, 
  BarChart3, 
  Users, 
  ArrowRight,
  Package,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { user } = useAuth();

  const getQuickActions = () => {
    switch (user?.role) {
      case 'loja':
        return [
          { label: 'Ver Dashboard', icon: BarChart3, path: '/dashboard' },
          { label: 'Minhas Lojas', icon: Store, path: '/minhas-lojas' },
          { label: 'Base Pedidos', icon: Package, path: '/base-pedidos' },
        ];
      case 'regional':
        return [
          { label: 'Ver Dashboard', icon: BarChart3, path: '/dashboard' },
          { label: 'Minhas Lojas', icon: Store, path: '/minhas-lojas' },
          { label: 'Base Pedidos', icon: Package, path: '/base-pedidos' },
        ];
      case 'corporativo':
        return [
          { label: 'Ver Dashboard', icon: BarChart3, path: '/dashboard' },
          { label: 'Upload Vendas', icon: Upload, path: '/upload-vendas' },
          { label: 'Gestão Usuários', icon: Users, path: '/gestao-usuarios' },
          { label: 'Configurações', icon: Settings, path: '/configurar-parametros' },
        ];
      default:
        return [];
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const quickActions = getQuickActions();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Bem-vindo ao Conciliação. O que você gostaria de fazer hoje?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="group p-6 bg-card border border-border rounded-lg hover:border-foreground/20 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary rounded-lg group-hover:bg-foreground/5 transition-colors">
                      <IconComponent className="w-6 h-6 text-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{action.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="mt-12 p-6 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Dica:</strong> Use o menu lateral para navegar entre as funcionalidades do sistema. 
            Seu perfil de acesso é <span className="font-medium text-foreground capitalize">{user?.role}</span>.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
