import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Settings, LogOut, Users, BarChart2, MessageCircle, Utensils, Package, Percent, DollarSign, BookOpen, ShoppingBag, X, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PedinuLogo from '@/components/ui/PedinuLogo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Início', icon: Home, path: '/dashboard' },
    { name: 'Gerenciar Cardápio', icon: BookOpen, path: '/menu' }, 
    { name: 'Produtos', icon: Package, path: '/products' }, 
    { name: 'Pedidos na Cozinha', icon: Utensils, path: '/kitchen' }, 
    { name: 'Clientes', icon: Users, path: '/customers' },
    { name: 'Financeiro', icon: DollarSign, path: '/financial' },
    { name: 'Planos e Assinatura', icon: ShoppingBag, path: '/planos' },
    { name: 'Bot WhatsApp', icon: MessageCircle, path: '/whatsapp' },
    { name: 'Marketing', icon: Percent, path: '/marketing' },
    { name: 'Relatórios', icon: BarChart2, path: '/inventory' }, 
    { name: 'Configurações Gerais', icon: Settings, path: '/settings' },
  ];
  
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "tween", 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    closed: { 
      x: '-100%',
      transition: { 
        type: "tween", 
        duration: 0.3,
        ease: "easeIn"
      }
    },
  };

  const overlayVariants = {
    open: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    closed: { 
      opacity: 0,
      transition: { duration: 0.2 }
    },
  };

  const getLinkClasses = (path, isMinimized = false) => {
    const isActive = location.pathname === path || (path === '/products' && location.pathname.startsWith('/products')) || (path === '/menu' && location.pathname.startsWith('/menu'));
    let baseClasses = `flex items-center p-2.5 rounded-lg transition-all duration-200 ease-in-out group ${isMinimized ? 'justify-center' : 'justify-start'}`;
    
    return `${baseClasses} ${isActive ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'}`;
  };

  const getIconColor = (path) => {
    const isActive = location.pathname === path || (path === '/products' && location.pathname.startsWith('/products')) || (path === '/menu' && location.pathname.startsWith('/menu'));
    return isActive ? 'text-white' : 'text-gray-500 group-hover:text-orange-600';
  };

  const DesktopSidebar = () => (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen z-30">
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? 264 : 70 }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className="bg-white shadow-xl border-r border-gray-200 flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
          {isSidebarOpen ? (
            <>
              <PedinuLogo variant="full" size="sm" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 mx-auto"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="flex-1 mt-4 px-2 space-y-1.5 overflow-y-auto">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link 
                    to={item.path} 
                    className={getLinkClasses(item.path, !isSidebarOpen)}
                  >
                    <item.icon className={`h-5 w-5 ${!isSidebarOpen ? '' : 'mr-3'} ${getIconColor(item.path)}`} />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </TooltipTrigger>
                {!isSidebarOpen && (
                  <TooltipContent side="right" className="ml-2">
                    <p>{item.name}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={`${getLinkClasses('', !isSidebarOpen)} w-full`}
                >
                  <LogOut className={`h-5 w-5 ${!isSidebarOpen ? '' : 'mr-3'} text-red-500 group-hover:text-red-600`} />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        Sair
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              {!isSidebarOpen && (
                <TooltipContent side="right" className="ml-2">
                  <p>Sair</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
    </div>
  );

  const MobileSidebar = () => (
    <AnimatePresence mode="wait">
      {isSidebarOpen && (
        <>
          <motion.div
            key="mobile-sidebar"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <PedinuLogo variant="full" size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-4 px-2 space-y-1.5 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={getLinkClasses(item.path, false)} 
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${getIconColor(item.path)}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={`${getLinkClasses('', false)} w-full`}
              >
                <LogOut className="h-5 w-5 mr-3 text-red-500 group-hover:text-red-600" />
                <span className="text-sm font-medium">Sair</span>
              </Button>
            </div>
          </motion.div>
          <motion.div
            key="mobile-overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;