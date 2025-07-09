import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MetricCard = ({ title, value, icon: Icon, color, change, changeType }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="admin-card shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium admin-text">{title}</CardTitle>
          {Icon && <Icon className={`h-5 w-5 ${color || 'text-muted-foreground'}`} />}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold admin-text">{value}</div>
          {change && (
            <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-emerald-500' : 'text-red-500'}`}>
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;