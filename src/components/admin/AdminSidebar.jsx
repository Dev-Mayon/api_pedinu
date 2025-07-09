import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LayoutDashboard, Users, DollarSign, Settings as SettingsIcon, LogOut, ChevronLeft, ChevronRight, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Usuários', path: '/admin/users' },
  { icon: DollarSign, label: 'Saques', path: '/admin/withdrawals' },
  { 
    icon: SettingsIcon, 
    label: 'Configurações', 
    path: '/admin/settings',
    subItems: [
      { icon: MessageSquare, label: 'Bot WhatsApp', path: '/admin/settings/whatsapp' },
    ]
  },
];

function AdminSidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { adminLogout } = useAdminAuth();

  const renderMenuItem = (item, isSubItem = false) => {
    const Icon = item.icon;
    const isActive = isSubItem 
      ? location.pathname === item.path
      : location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path) && !item.subItems);

    const isParentActive = item.subItems && item.subItems.some(sub => location.pathname.startsWith(sub.path));

    return (
      <Tooltip key={item.path}>
        <TooltipTrigger asChild>
          <Link to={item.path} onClick={window.innerWidth < 768 && !collapsed ? onToggle : undefined}>
            <motion.div
              whileHover={{ scale: collapsed && !isSubItem ? 1.1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                ${isSubItem ? 'pl-8' : ''}
                ${isActive || (isParentActive && !isSubItem && item.label === 'Configurações')
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`h-5 w-5 ${collapsed && !isActive && !isParentActive ? 'text-gray-600' : ''} ${collapsed && (isActive || isParentActive) ? 'text-white' : ''}`} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`font-medium text-sm ${isSubItem && !isActive ? 'text-gray-500' : ''}`}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.div>
          </Link>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="bg-gray-800 text-white border">
            <p>{item.label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        initial={false}
        animate={ window.innerWidth < 768 ? (collapsed ? "closed" : "open") : { width: collapsed ? 80 : 256 } }
        variants={window.innerWidth < 768 ? sidebarVariants : {}}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 shadow-lg flex flex-col
          ${window.innerWidth >= 768 ? (collapsed ? 'w-20' : 'w-64') : 'w-64'}
        `}
      >
        <div className={`flex items-center p-4 border-b border-gray-200 ${collapsed && window.innerWidth >= 768 ? 'justify-center' : 'justify-between'}`}>
          {! (collapsed && window.innerWidth >= 768) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-gray-800 text-lg">Admin</span>
            </motion.div>
          )}
           <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={`text-gray-500 hover:text-gray-700 ${window.innerWidth >= 768 ? (collapsed ? 'mx-auto' : '') : ''}`}
          >
            {window.innerWidth < 768 ? <X className="h-5 w-5" /> : (collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />)}
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar-sm">
          {menuItems.map((item) => (
            <React.Fragment key={item.path}>
              {renderMenuItem(item)}
              {!collapsed && item.subItems && (location.pathname.startsWith(item.path) || item.subItems.some(sub => location.pathname.startsWith(sub.path))) && (
                 <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2"
                  >
                  {item.subItems.map((subItem) => renderMenuItem(subItem, true))}
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => {
                  adminLogout();
                  if (window.innerWidth < 768 && !collapsed) onToggle();
                }}
                whileHover={{ scale: collapsed && window.innerWidth >=768 ? 1.1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 w-full
                  text-gray-600 hover:bg-gray-100 hover:text-gray-800
                  ${collapsed && window.innerWidth >=768 ? 'justify-center' : ''}
                `}
              >
                <LogOut className="h-5 w-5" />
                {!(collapsed && window.innerWidth >=768) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium text-sm"
                  >
                    Sair
                  </motion.span>
                )}
              </motion.button>
            </TooltipTrigger>
            {collapsed && window.innerWidth >=768 && (
              <TooltipContent side="right" className="bg-gray-800 text-white border">
                <p>Sair</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}

export default AdminSidebar;