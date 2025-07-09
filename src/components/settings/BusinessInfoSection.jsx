import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Store, User, FileText, Edit3, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import InputMask from 'react-input-mask';
import { cn } from '@/lib/utils';

const BusinessInfoSection = ({ formData, onProfileChange, onSettingsChange }) => {
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  if (!formData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informações do Negócio</CardTitle>
          <CardDescription>Carregando informações...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const documentMask = (formData.document_number || '').length > 11 ? "99.999.999/9999-99" : "999.999.999-99";

  const handleDateInputChange = (e) => {
    const dateStr = e.target.value;
    onProfileChange('birth_date', dateStr); // Store raw string temporarily
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate)) {
      onProfileChange('birth_date', parsedDate.toISOString().split('T')[0]);
    }
  };

  const handleDateSelect = (date) => {
    onProfileChange('birth_date', date ? date.toISOString().split('T')[0] : null);
    setIsCalendarOpen(false);
  };

  const getBirthDateValue = () => {
    if (!formData.birth_date) return '';
    try {
      // Check if it's already in dd/MM/yyyy format from input
      if (typeof formData.birth_date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(formData.birth_date)) {
        return formData.birth_date;
      }
      // Otherwise, format from ISO date
      const date = new Date(formData.birth_date + 'T00:00:00'); // Ensure correct timezone handling
      if (isValid(date)) {
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
    } catch (error) {
      // Ignore invalid date formats during typing
    }
    return formData.birth_date; // return raw string if not a valid date yet
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Negócio</CardTitle>
        <CardDescription>Configure os detalhes de contato, proprietário e descrição.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="business_name">Nome do Estabelecimento</Label>
          <div className="relative mt-1">
            <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              id="business_name" 
              value={formData.business_name || ''} 
              onChange={(e) => onProfileChange('business_name', e.target.value)} 
              placeholder="Pizzaria do Zé" 
              className="pl-10 text-sm bg-white border-gray-300" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="owner_name">Nome do Proprietário</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="owner_name"
                name="name"
                value={formData.name || ''}
                onChange={(e) => onProfileChange('name', e.target.value)}
                placeholder="Nome do responsável"
                className="pl-10 text-sm bg-white border-gray-300"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <div className="relative mt-1">
                <InputMask
                  mask="99/99/9999"
                  value={getBirthDateValue()}
                  onChange={handleDateInputChange}
                >
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      id="birth_date"
                      placeholder="dd/mm/aaaa"
                      className="pl-3 pr-10 text-sm bg-white border-gray-300"
                    />
                  )}
                </InputMask>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-gray-500 hover:bg-gray-100"
                    onClick={() => setIsCalendarOpen((v) => !v)}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.birth_date && isValid(new Date(formData.birth_date)) ? new Date(formData.birth_date) : null}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={ptBR}
                  captionLayout="dropdown-buttons"
                  fromYear={1930}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label htmlFor="document_number">CPF / CNPJ</Label>
          <div className="relative mt-1 flex items-center gap-2">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <InputMask
                mask={documentMask}
                value={formData.document_number || ''}
                readOnly
                disabled
              >
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    id="document_number"
                    className="pl-10 text-sm bg-gray-100 border-gray-300 cursor-not-allowed flex-grow"
                  />
                )}
              </InputMask>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings/change-document')}>
              <Edit3 className="h-3 w-3 mr-1"/>
              Alterar
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição Curta</Label>
          <Textarea 
            id="description" 
            value={formData.description || ''} 
            onChange={(e) => onSettingsChange('description', e.target.value)} 
            placeholder="Ex: A melhor pizza da cidade!" 
            rows={3} 
            className="text-sm bg-white border-gray-300" 
          />
        </div>

        <div>
          <Label htmlFor="address">Endereço Completo</Label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              id="address" 
              value={formData.address || ''} 
              onChange={(e) => onSettingsChange('address', e.target.value)} 
              placeholder="Rua Exemplo, 123, Cidade" 
              className="pl-10 text-sm bg-white border-gray-300" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Telefone (com DDD)</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="phone" 
                value={formData.phone || ''} 
                onChange={(e) => onSettingsChange('phone', e.target.value)} 
                placeholder="(11) 91234-5678" 
                className="pl-10 text-sm bg-white border-gray-300" 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
            <div className="relative mt-1">
              <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="whatsapp" 
                value={formData.whatsapp || ''} 
                onChange={(e) => onSettingsChange('whatsapp', e.target.value)} 
                placeholder="(11) 91234-5678" 
                className="pl-10 text-sm bg-white border-gray-300" 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessInfoSection;