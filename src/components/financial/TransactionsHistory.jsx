import React from 'react';
import { motion } from 'framer-motion';
import { Info, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import DatePickerWithRange from '@/components/ui/date-picker-with-range';

const getStatusVariant = (status) => {
  switch (status) {
    case 'approved': return 'default';
    case 'pending': return 'secondary';
    case 'failed': return 'destructive';
    default: return 'outline';
  }
};

function TransactionsHistory({ transactions, date, setDate, onGenerateReport, isGeneratingReport }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Movimentações financeiras no período selecionado.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <DatePickerWithRange date={date} setDate={setDate} />
              <Button onClick={onGenerateReport} disabled={isGeneratingReport || transactions.length === 0}>
                <FileText className="h-4 w-4 mr-2" />
                {isGeneratingReport ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor Bruto</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Valor Líquido</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>#{t.order_id?.slice(-6) || 'N/A'}</TableCell>
                      <TableCell>{t.payment_method}</TableCell>
                      <TableCell>{formatPrice(t.gross_amount)}</TableCell>
                      <TableCell className="text-red-500">-{formatPrice(t.fee)}</TableCell>
                      <TableCell className="font-semibold">{formatPrice(t.net_amount)}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(t.status)}>{t.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Info className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>Nenhuma transação registrada neste período.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TransactionsHistory;