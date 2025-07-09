import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FloatingSupportButton = () => {
  const handleSupportClick = () => {
    if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
      window.Tawk_API.toggle();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 1,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSupportClick}
              className="rounded-full h-14 w-14 bg-gradient-to-br from-primary to-red-400 text-white shadow-2xl shadow-primary/40"
            >
              <MessageSquare className="h-7 w-7" />
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-foreground text-background">
          <p>Suporte Online 24/7</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FloatingSupportButton;