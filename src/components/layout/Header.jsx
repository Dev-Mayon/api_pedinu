import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserCircle, Share2, Settings, LogOut, BookOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = ({ toggleSidebar }) => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Painel Inicial';
    if (path.startsWith('/menu')) return 'Gerenciar Cardápio';
    if (path.startsWith('/products')) return 'Produtos';
    if (path.startsWith('/welcome')) return 'Bem-vindo(a)!';
    if (path.startsWith('/kitchen')) return 'Cozinha';
    if (path.startsWith('/inventory')) return 'Relatórios';
    if (path.startsWith('/whatsapp')) return 'WhatsApp Bot';
    if (path.startsWith('/customers')) return 'Clientes';
    if (path.startsWith('/marketing')) return 'Marketing';
    if (path.startsWith('/settings')) return 'Configurações';
    if (path.startsWith('/financial')) return 'Financeiro';
    if (path.startsWith('/planos')) return 'Planos e Assinatura';
    return 'Pedinu';
  };
  
  const businessSlug = user?.business_slug;

  const handleViewCardapio = () => {
    if (businessSlug) {
      const cardapioUrl = `${window.location.origin}/cardapio/${businessSlug}`;
      window.open(cardapioUrl, '_blank');
    } else {
      toast({
        title: "Cardápio Indisponível",
        description: "O link do seu negócio ainda não foi configurado.",
        variant: "destructive",
      });
    }
  };

  const handleShareCardapio = async () => {
    if (!businessSlug) {
      toast({
        title: "Cardápio Indisponível",
        description: "O link do seu negócio não pode ser compartilhado.",
        variant: "destructive",
      });
      return;
    }

    const shareData = {
      title: `Confira o cardápio de ${user.business_name || 'nosso estabelecimento'}`,
      text: 'Faça seu pedido de forma rápida e fácil!',
      url: `${window.location.origin}/cardapio/${businessSlug}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copiado!",
          description: "O compartilhamento nativo não é suportado. O link foi copiado para a área de transferência.",
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Silently fail on share abort
    }
  };


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full p-3 sm:p-4 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between max-w-full px-0 sm:px-2">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-base sm:text-xl font-semibold text-gray-800 hidden sm:block">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewCardapio}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            disabled={loading || !businessSlug}
          >
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:mr-1.5" />
            <span className="hidden md:inline">Ver Cardápio</span>
          </Button>
          <Button
            size="sm"
            onClick={handleShareCardapio}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            disabled={loading || !businessSlug}
          >
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:mr-1.5" />
            <span className="hidden md:inline">Compartilhar</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-700">
                <UserCircle className="h-6 w-6 sm:h-7 sm:w-7" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuLabel className="text-gray-800">
                {user?.business_name || user?.email || 'Minha Conta'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem asChild className="text-gray-800 hover:!bg-gray-50 focus:!bg-gray-50 cursor-pointer">
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleViewCardapio}
                disabled={loading || !businessSlug}
                className="text-gray-800 hover:!bg-gray-50 focus:!bg-gray-50 cursor-pointer"
              >
                <BookOpen className="mr-2 h-4 w-4 text-gray-500" />
                <span>Ver meu Cardápio</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-500 hover:!bg-red-500/10 focus:!bg-red-500/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;