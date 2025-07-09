import React from 'react';
import { Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const CatalogLinkSection = ({ businessSlug, isLoading }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const catalogUrl = businessSlug ? `${window.location.origin}/cardapio/${businessSlug}` : "";

  const handleView = () => {
    if (catalogUrl) {
      window.open(catalogUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (!catalogUrl) {
      toast({ title: "Link indisponível", variant: "destructive" });
      return;
    }

    const shareData = {
      title: `Cardápio de ${user?.business_name || 'nosso estabelecimento'}`,
      text: 'Confira nosso cardápio e faça seu pedido!',
      url: catalogUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copiado!",
          description: "O link do cardápio foi copiado para a área de transferência.",
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
        toast({ title: "Falha ao compartilhar", variant: "destructive" });
      }
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Link do Cardápio Digital</CardTitle>
        <CardDescription>Use este link para divulgar seu cardápio para os clientes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Input
            value={isLoading ? "Carregando..." : (catalogUrl || "Configure seu negócio para gerar o link.")}
            readOnly
            disabled={isLoading || !businessSlug}
            className="flex-1 text-sm bg-gray-50 border-gray-300"
          />
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleView} className="flex-1 sm:flex-none hover:bg-gray-50 border-gray-300 text-xs sm:text-sm" disabled={isLoading || !businessSlug}>
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Ver
            </Button>
            <Button onClick={handleShare} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm" disabled={isLoading || !businessSlug}>
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Compartilhar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CatalogLinkSection;