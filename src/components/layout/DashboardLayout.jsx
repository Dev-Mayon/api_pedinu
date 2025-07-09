import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const layoutVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } }
  };

  return (
    <motion.div 
      key="dashboard-layout"
      className="flex h-screen bg-gray-50"
      variants={layoutVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Sidebar isSidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <motion.div 
        className="flex-1 flex flex-col"
        animate={{ 
          marginLeft: window.innerWidth >= 1024 ? (sidebarOpen ? 264 : 70) : 0
        }}
        transition={{ 
          type: "tween", 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
      >
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ height: 'calc(100vh - 64px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </motion.div>
  );
}

export default DashboardLayout;