import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, User, LogOut, Building2, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title = 'Dashboard', onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'loja':
        return 'Loja';
      case 'regional':
        return 'Regional';
      case 'corporativo':
        return 'Corporativo';
      default:
        return role;
    }
  };

  return (
    <>
      <header className="h-[60px] bg-background border-b border-border px-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-secondary rounded-md transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-foreground">Conciliação</span>
            <span className="hidden sm:block text-muted-foreground">|</span>
            <span className="hidden sm:block text-sm text-muted-foreground">{title}</span>
          </div>
        </div>

        {/* Center section - Corporation */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-lg border border-border">
          <Building2 className="w-4 h-4 text-foreground" />
          <span className="text-sm font-medium text-foreground">{user?.empresa || 'Empresa'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Button */}
          {user?.role === 'corporativo' && (
            <button
              onClick={() => navigate('/configurar-parametros')}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Parâmetros"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(user?.role || '')}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 md:hidden">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(user?.role || '')}</p>
              </div>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem 
                onClick={() => setShowLogoutDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair? Você será redirecionado para a página de login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-primary text-primary-foreground">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Header;
