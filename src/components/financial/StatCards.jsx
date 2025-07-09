import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

const statCardsConfig = [
  { title: 'Saldo Disponível', key: 'balance', icon: Wallet, color: 'from-green-500 to-green-600' },
  { title: 'Saldo Pendente', key: 'pendingWithdrawal', icon: Download, color: 'from-pink-500 to-pink-600' }
];

function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {statCardsConfig.map((stat, index) => (
        <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats[stat.key])}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}><stat.icon className="h-6 w-6 text-white" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default StatCards;