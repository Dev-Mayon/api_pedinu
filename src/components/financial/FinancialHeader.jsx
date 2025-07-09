import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatPrice } from '@/lib/utils';

function FinancialHeader({ balance, loading, pixKey, isRequestingWithdrawal, handleWithdrawalRequest }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-600 mt-1">Gerencie suas vendas, taxas e saques</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="bg-gradient-to-r from-green-500 to-green-600" disabled={balance <= 0 || loading}>
            <Wallet className="h-4 w-4 mr-2" /> Solicitar Saque
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Solicitação de Saque</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a solicitar um saque de todo o seu saldo disponível: <strong className="text-lg">{formatPrice(balance)}</strong>.
              O valor será transferido para a chave Pix: <strong>{pixKey || 'Nenhuma chave cadastrada'}</strong>.
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdrawalRequest}
              disabled={isRequestingWithdrawal || !pixKey || balance <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRequestingWithdrawal ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Saque"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export default FinancialHeader;