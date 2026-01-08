import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { X } from 'lucide-react';
import {
  LayoutDashboard,
  Store,
  Download,
  CheckCircle,
  History,
  Package,
  Map,
  Users,
  Key,
  Settings,
  Wrench,
  Upload,
  RefreshCw,
  Home,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuGroup {
  id: string;
  label: string;
  items: MenuItemType[];
}

interface MenuItemType {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

const getMenuGroups = (role: UserRole): MenuGroup[] => {
  const lojaGroups: MenuGroup[] = [
    {
      id: 'principal',
      label: 'Principal',
      items: [
        { id: 'home', label: 'Home', icon: 'Home', path: '/home' },
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
      ],
    },
    {
      id: 'lojas',
      label: 'Gestão de Lojas',
      items: [
        { id: 'minhas-lojas', label: 'Minhas Lojas', icon: 'Store', path: '/minhas-lojas' },
        { id: 'exportar-lojas', label: 'Exportar Lojas', icon: 'Download', path: '/exportar-lojas' },
        { id: 'finalizar-loja', label: 'Finalizar Loja', icon: 'CheckCircle', path: '/finalizar-loja' },
        { id: 'historico-lojas', label: 'Histórico de Lojas', icon: 'History', path: '/historico-lojas' },
      ],
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      items: [
        { id: 'base-pedidos', label: 'Base Pedidos', icon: 'Package', path: '/base-pedidos' },
      ],
    },
  ];

  const regionalGroups: MenuGroup[] = [
    {
      id: 'principal',
      label: 'Principal',
      items: [
        { id: 'home', label: 'Home', icon: 'Home', path: '/home' },
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
      ],
    },
    {
      id: 'lojas',
      label: 'Gestão de Lojas',
      items: [
        { id: 'minhas-lojas', label: 'Minhas Lojas', icon: 'Store', path: '/minhas-lojas' },
        { id: 'exportar-lojas', label: 'Exportar Lojas', icon: 'Download', path: '/exportar-lojas' },
        { id: 'finalizar-loja', label: 'Finalizar Loja', icon: 'CheckCircle', path: '/finalizar-loja' },
        { id: 'historico-lojas', label: 'Histórico de Lojas', icon: 'History', path: '/historico-lojas' },
      ],
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      items: [
        { id: 'base-pedidos', label: 'Base Pedidos', icon: 'Package', path: '/base-pedidos' },
      ],
    },
  ];

  const corporativoGroups: MenuGroup[] = [
    {
      id: 'principal',
      label: 'Principal',
      items: [
        { id: 'home', label: 'Home', icon: 'Home', path: '/home' },
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
      ],
    },
    {
      id: 'cadastros',
      label: 'Cadastros',
      items: [
        { id: 'regionais', label: 'Regionais', icon: 'Map', path: '/regionais' },
        { id: 'lojas', label: 'Lojas', icon: 'Store', path: '/lojas' },
        { id: 'usuarios', label: 'Usuários', icon: 'Users', path: '/usuarios' },
      ],
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      items: [
        { id: 'gestao-credenciais', label: 'Credenciais iFood', icon: 'Key', path: '/gestao-credenciais' },
        { id: 'configurar-parametros', label: 'Parâmetros', icon: 'Settings', path: '/configurar-parametros' },
      ],
    },
    {
      id: 'uploads',
      label: 'Uploads',
      items: [
        { id: 'upload-vendas', label: 'Upload Vendas', icon: 'Upload', path: '/upload-vendas' },
        { id: 'historico-uploads', label: 'Histórico de Uploads', icon: 'History', path: '/historico-uploads' },
      ],
    },
    {
      id: 'processamento',
      label: 'Processamento',
      items: [
        { id: 'batch-rcod', label: 'Batch Atualização Rcod', icon: 'RefreshCw', path: '/batch-rcod' },
      ],
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      items: [
        { id: 'base-pedidos', label: 'Base Pedidos', icon: 'Package', path: '/base-pedidos' },
      ],
    },
  ];

  switch (role) {
    case 'loja':
      return lojaGroups;
    case 'regional':
      return regionalGroups;
    case 'corporativo':
      return corporativoGroups;
    default:
      return lojaGroups;
  }
};

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  LayoutDashboard,
  Store,
  Download,
  CheckCircle,
  History,
  Package,
  Map,
  Users,
  Key,
  Settings,
  Wrench,
  Upload,
  RefreshCw,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const menuGroups = getMenuGroups(user?.role || 'loja');

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-sidebar-border lg:hidden">
          <span className="text-xl font-bold text-foreground">Conciliação</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:flex items-center h-[60px] px-4 border-b border-sidebar-border">
          <span className="text-xl font-bold text-foreground">Conciliação</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-60px)]">
          {menuGroups.map((group) => (
            <div key={group.id} className="mb-4">
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const IconComponent = iconComponents[item.icon] || LayoutDashboard;
                  
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
                      }
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="badge">{item.badge}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
