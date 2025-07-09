import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SimpleBarChart = ({ data, title, xAxisLabel, yAxisLabel }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);

  const barColor = '#ef4444'; 
  const textColor = '#374151'; 
  const gridColor = '#e5e7eb'; 

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const barVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <TooltipProvider>
      <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="flex items-end h-64 space-x-2 border-b border-l" style={{ borderColor: gridColor }}>
          <motion.div 
            className="flex items-end h-full space-x-2 md:space-x-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <motion.div
                    variants={barVariants}
                    className="flex-1 flex flex-col items-center justify-end group"
                  >
                    <div
                      className="w-full rounded-t-sm hover:opacity-80 transition-opacity"
                      style={{
                        height: `${(item.value / (maxValue || 1)) * 100}%`,
                        backgroundColor: barColor,
                      }}
                    />
                    <span className="text-xs mt-1 text-gray-500 truncate group-hover:font-semibold" style={{ color: textColor }}>
                      {item.label}
                    </span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border">
                  <p>{item.label}: <span className="font-bold">{item.value}</span> {yAxisLabel}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </motion.div>
        </div>
        <p className="text-center text-xs mt-2 text-gray-500" style={{ color: textColor }}>{xAxisLabel}</p>
      </div>
    </TooltipProvider>
  );
};

export default SimpleBarChart;