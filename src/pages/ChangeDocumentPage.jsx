import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Send } from 'lucide-react';

function ChangeDocumentPage() {
  const supportEmail = "suporte@pedinu.com.br";
  const emailSubject = "Solicitação de Alteração de CPF/CNPJ";
  const emailBody = `Olá, equipe de suporte do Pedinu,

Gostaria de solicitar a alteração do meu CPF/CNPJ cadastrado.

Motivo da alteração: [Explique brevemente o motivo, ex: Migração de MEI para ME]

Anexei os documentos necessários para comprovação.

Atenciosamente,
[Seu Nome Completo]
[Nome do seu Estabelecimento]`;

  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="p-6 space-y-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-orange-100 rounded-full">
              <LifeBuoy className="h-12 w-12 text-orange-500" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">Alteração de Documento (CPF/CNPJ)</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Para garantir a segurança da sua conta, a alteração do documento é um processo feito com a nossa equipe de suporte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Instruções Importantes</h3>
            <ol className="list-decimal list-inside mt-2 text-yellow-700 space-y-2">
              <li>
                <strong>Prepare a documentação:</strong> Para alterar seu CPF ou CNPJ, você precisará nos enviar uma foto do seu documento de identificação (RG ou CNH) e, se for para um CNPJ, o cartão CNPJ da empresa.
              </li>
              <li>
                <strong>Envie um e-mail:</strong> Clique no botão abaixo para abrir seu cliente de e-mail com um modelo pronto. Anexe os documentos e envie para nossa equipe.
              </li>
              <li>
                <strong>Aguarde nosso contato:</strong> Nossa equipe de segurança analisará sua solicitação e os documentos. Entraremos em contato em até 48 horas úteis para confirmar a alteração.
              </li>
            </ol>
          </div>

          <p className="text-sm text-center text-gray-500">
            Este processo é uma medida de segurança para proteger sua conta e seus dados financeiros. Agradecemos a sua compreensão.
          </p>
          
          <div className="flex justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
              <a href={mailtoLink}>
                <Send className="mr-2 h-5 w-5" />
                Iniciar Solicitação por E-mail
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChangeDocumentPage;