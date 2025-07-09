import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function PlatformFees() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="bg-red-50 border-red-200">
        <CardHeader><CardTitle className="text-red-900 flex items-center"><AlertCircle className="h-5 w-5 mr-2" />Taxas da Plataforma</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-red-800">
            <p>• <strong>Pix:</strong> 1,98% sobre cada venda</p>
            <p>• <strong>Cartão de Crédito (1x):</strong> 5,5% sobre cada venda</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PlatformFees;