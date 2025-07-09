import React from 'react';
import { motion } from 'framer-motion';
import { Bell, User, LogOut, Menu as MenuIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/components/ui/use-toast';
import PedinuLogo from '@/components/ui/PedinuLogo';

function AdminHeader({ onToggleSidebar, sidebarCollapsed }) {
  const { adminUser, adminLogout } = useAdminAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do painel de administração."
    });
  };

  const handleNotImplemented = () => {
    toast({
      title: "🚧 Funcionalidade não implementada",
      description: "Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀",
    });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2 text-gray-500 hover:text-gray-700">
            <MenuIcon className="h-6 w-6" />
          </Button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar no painel..."
              className="pl-10 bg-white border-gray-300 w-64"
              onClick={handleNotImplemented}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700" onClick={handleNotImplemented}>
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              2
            </span>
          </Button>

          <div className="flex items-center space-x-2">
            <PedinuLogo variant="icon" size="sm" />
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-800">{adminUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{adminUser?.email}</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

export default AdminHeader;