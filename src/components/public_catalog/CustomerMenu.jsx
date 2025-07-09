import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { User, LogOut, ShoppingBag, MapPin, ChevronDown } from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';

const CustomerMenu = ({ onLoginClick }) => {
  const { isIdentified, customer, clearCustomer } = useCustomer();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearCustomer();
    // Optional: navigate to home or refresh
  };
  
  const handleMyOrders = () => {
    navigate('/my-orders');
  };

  const handleMyAddresses = () => {
    navigate('/my-addresses');
  };

  if (isIdentified) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-auto px-3 flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <User size={18} />
            <span className="font-semibold text-sm hidden sm:inline">{customer.name.split(' ')[0]}</span>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Olá, {customer.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleMyOrders}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Meus Pedidos</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMyAddresses}>
            <MapPin className="mr-2 h-4 w-4" />
            <span>Meus Endereços</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onLoginClick} 
      className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
    >
      <User size={18} />
    </Button>
  );
};

export default CustomerMenu;