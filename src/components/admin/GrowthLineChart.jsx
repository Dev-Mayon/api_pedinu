import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
        <p className="label font-bold">{`${label}`}</p>
        <p className="intro text-sm">{`Novos Cadastros: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const GrowthLineChart = ({ data, isLoading, error }) => {
  const hasData = data && data.length > 0 && data.some(d => d.cadastros > 0);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const chartContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="admin-text text-lg">Carregando gráfico de crescimento...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <p className="admin-text text-lg font-semibold">Erro ao carregar o gráfico</p>
          <p className="text-sm text-muted-foreground">Não foi possível buscar os dados. Tente novamente.</p>
        </div>
      );
    }
    
    if (!hasData) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
          <p className="admin-text text-lg font-semibold">Sem dados de crescimento</p>
          <p className="text-sm text-muted-foreground">Novos cadastros aparecerão aqui.</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorCadastros" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }} />
          <Line 
            type="monotone" 
            dataKey="cadastros" 
            stroke="#22c55e"
            strokeWidth={3} 
            dot={{ r: 5, fill: '#22c55e', strokeWidth: 2, stroke: 'white' }} 
            activeDot={{ r: 8, fill: '#22c55e', strokeWidth: 2, stroke: 'white' }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="admin-card shadow-lg h-[400px]">
        <CardHeader>
          <CardTitle className="admin-text">Crescimento de Cadastros</CardTitle>
          <CardDescription>Novos usuários nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full p-2">
          {chartContent()}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GrowthLineChart;