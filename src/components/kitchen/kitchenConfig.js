import { Hourglass, Bell, Utensils, CheckCircle, ShoppingBag, XCircle, BadgeCheck } from 'lucide-react';

export const orderStatusConfig = {
  pending_payment: {
    title: 'Aguardando Pagamento',
    icon: Hourglass,
    bgColor: 'bg-yellow-400',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-400',
    emptyBgColor: 'bg-yellow-50',
    next: null,
    prev: null
  },
  received: { 
    title: 'Em análise', 
    icon: Bell, 
    bgColor: 'bg-red-500', 
    textColor: 'text-white',
    borderColor: 'border-red-400',
    emptyBgColor: 'bg-red-50',
    next: 'approved', 
    prev: null 
  },
  approved: {
    title: 'Aprovado',
    icon: BadgeCheck,
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-400',
    emptyBgColor: 'bg-blue-50',
    next: 'preparing',
    prev: 'received'
  },
  preparing: { 
    title: 'Em produção', 
    icon: Utensils, 
    bgColor: 'bg-orange-500', 
    textColor: 'text-white',
    borderColor: 'border-orange-400',
    emptyBgColor: 'bg-orange-50',
    next: 'ready', 
    prev: 'approved' 
  },
  ready: { 
    title: 'Prontos para entrega', 
    icon: CheckCircle, 
    bgColor: 'bg-green-500', 
    textColor: 'text-white',
    borderColor: 'border-green-400',
    emptyBgColor: 'bg-green-50',
    next: 'completed', 
    prev: 'preparing' 
  },
  completed: { 
    title: 'Finalizados', 
    icon: ShoppingBag, 
    bgColor: 'bg-gray-400', 
    textColor: 'text-white',
    borderColor: 'border-gray-400',
    emptyBgColor: 'bg-gray-50',
    next: null, 
    prev: 'ready' 
  },
  cancelled: { 
    title: 'Cancelados', 
    icon: XCircle, 
    bgColor: 'bg-gray-400', 
    textColor: 'text-white',
    borderColor: 'border-gray-400',
    emptyBgColor: 'bg-gray-50',
    next: null, 
    prev: null
  },
};

export const kitchenViewStatuses = ['received', 'approved', 'preparing', 'ready'];