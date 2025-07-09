import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, MapPin, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

const CustomerList = ({ customers, onSelectCustomer, selectedCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() =>
    customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.neighborhood && customer.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [customers, searchTerm]
  );

  return (
    <motion.div
      className="lg:col-span-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="h-full bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Clientes</CardTitle>
          <CardDescription className="text-muted-foreground">
            {filteredCustomers.length} cliente(s) encontrado(s)
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, telefone ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-red-500/10 border-red-500/50'
                      : 'border-border bg-background/50 hover:border-primary/20'
                  }`}
                  onClick={() => onSelectCustomer(customer)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                      {customer.neighborhood && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{customer.neighborhood}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right pl-2 flex flex-col items-end">
                      <Badge variant="secondary" className="mb-2 whitespace-nowrap">
                        {customer.total_orders} {customer.total_orders === 1 ? 'pedido' : 'pedidos'}
                      </Badge>
                      <div className="text-sm font-bold text-green-600 whitespace-nowrap">
                        {formatPrice(customer.total_spent)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <Info className="h-10 w-10 mx-auto mb-2 text-muted-foreground/70" />
                <p>{searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
                <p className="text-xs">Novos clientes aparecerão aqui.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerList;