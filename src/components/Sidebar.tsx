import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MenuItem, UserRole } from '@/types';
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

const getMenuItems = (role: UserRole): MenuItem[] => {
  const lojaItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: 'Home', path: '/home' },
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    { id: 'minhas-lojas', label: 'Minhas Lojas', icon: 'Store', path: '/minhas-lojas' },
    { id: 'exportar-lojas', label: 'Exportar Lojas', icon: 'Download', path: '/exportar-lojas' },
    { id: 'finalizar-loja', label: 'Finalizar Loja', icon: 'CheckCircle', path: '/finalizar-loja' },
    { id: 'historico-lojas', label: 'Histórico de Lojas', icon: 'History', path: '/historico-lojas' },
    { id: 'base-pedidos', label: 'Base Pedidos', icon: 'Package', path: '/base-pedidos' },
  ];

  const regionalItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: 'Home', path: '/home' },
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    { id: 'minhas-lojas', label: 'Minhas Lojas', icon: 'Store', path: '/minhas-lojas' },
    { id: 'exportar-lojas', label: 'Exportar Lojas', icon: 'Download', path: '/exportar-lojas' },
    { id: 'finalizar-loja', label: 'Finalizar Loja', icon: 'CheckCircle', path: '/finalizar-loja' },
    { id: 'historico-lojas', label: 'Histórico de Lojas', icon: 'History', path: '/historico-lojas' },
    { id: 'base-pedidos', label: 'Base Pedidos', icon: 'Package', path: '/base-pedidos' },
  ];

  const corporativoItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: 'Home', path: '/home' },
    { id: 'regionais', label: 'Regionais', icon: 'Map', path: '/regionais' },
    { id: 'lojas', label: 'Lojas', icon: 'Store', path: '/lojas' },
    { id: 'usuarios', label: 'Usuários', icon: 'Users', path: '/usuarios' },
    { id: 'gestao-credenciais', label: 'Gestão Credenciais iFood', icon: 'Key', path: '/gestao-credenciais' },
    { id: 'configurar-parametros', label: 'Configurar Parâmetros', icon: 'Settings', path: '/configurar-parametros' },
    { id: 'parametros-setup', label: 'Parâmetros Setup', icon: 'Wrench', path: '/parametros-setup' },
    { id: 'upload-vendas', label: 'Upload Vendas', icon: 'Upload', path: '/upload-vendas', badge: 2 },
    { id: 'historico-uploads', label: 'Histórico de Uploads', icon: 'History', path: '/historico-uploads' },
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    { id: 'batch-rcod', label: 'Batch Atualização Rcod', icon: 'RefreshCw', path: '/batch-rcod' },
    { id: 'batch-consignado', label: 'Batch Atualização Consignado', icon: 'RefreshCw', path: '/batch-consignado' },
    { id: 'base-pedidos', label: 'Base Pedidos', icon: 'Package', path: '/base-pedidos' },
  ];

  switch (role) {
    case 'loja':
      return lojaItems;
    case 'regional':
      return regionalItems;
    case 'corporativo':
      return corporativoItems;
    default:
      return lojaItems;
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
  const menuItems = getMenuItems(user?.role || 'loja');

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
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-60px)]">
          {menuItems.map((item) => {
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
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
