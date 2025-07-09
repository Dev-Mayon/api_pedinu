import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School as University, Percent, Fingerprint } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PixSettings from '@/components/financial/PixSettings';
import PlatformFees from '@/components/financial/PlatformFees';

function IdentityTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identidade</CardTitle>
        <CardDescription>Informações de verificação da sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
          <Fingerprint className="h-12 w-12 mb-4" />
          <p className="font-semibold">Verificação de Identidade</p>
          <p className="text-sm">Esta funcionalidade estará disponível em breve para aumentar a segurança da sua conta.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialSettings({ pixKey, setPixKey, handleSavePixKey, isSavingPix }) {
  return (
    <Tabs defaultValue="banking" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="banking">
          <University className="mr-2 h-4 w-4" />
          Dados Bancários
        </TabsTrigger>
        <TabsTrigger value="fees">
          <Percent className="mr-2 h-4 w-4" />
          Taxas e Prazos
        </TabsTrigger>
        <TabsTrigger value="identity">
          <Fingerprint className="mr-2 h-4 w-4" />
          Identidade
        </TabsTrigger>
      </TabsList>
      <TabsContent value="banking" className="mt-4">
        <PixSettings 
          pixKey={pixKey}
          setPixKey={setPixKey}
          handleSavePixKey={handleSavePixKey}
          isSavingPix={isSavingPix}
        />
      </TabsContent>
      <TabsContent value="fees" className="mt-4">
        <PlatformFees />
      </TabsContent>
      <TabsContent value="identity" className="mt-4">
        <IdentityTab />
      </TabsContent>
    </Tabs>
  );
}

export default FinancialSettings;