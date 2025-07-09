import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import BusinessInfoSection from '@/components/settings/BusinessInfoSection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import DeliveryZonesSection from '@/components/settings/DeliveryZonesSection';
import CatalogLinkSection from '@/components/settings/CatalogLinkSection';
import PrintingSection from '@/components/settings/PrintingSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Loader2 } from 'lucide-react';

function Settings() {
  const { businessSettings, deliveryZones, addDeliveryZone, updateDeliveryZone, deleteDeliveryZone, updateBusinessSettings, printerSettings, updatePrinterSettings, loadingData } = useData();
  const { user, updateUserProfileAndAuth, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState({});
  const [localProfile, setLocalProfile] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [localPrinterSettings, setLocalPrinterSettings] = useState({ name: '', auto_print: false });

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const {
    uploading: uploadingImage,
    uploadImage,
    removeImage,
  } = useImageUpload(user, toast);

  useEffect(() => {
    if (businessSettings) {
      setLocalSettings({ ...businessSettings });
    }
    if (user) {
      setLocalProfile({
        name: user.name || '',
        business_name: user.business_name || '',
        birth_date: user.birth_date || null,
      });
    }
    if (printerSettings) {
      setLocalPrinterSettings({ ...printerSettings });
    }
  }, [businessSettings, user, printerSettings]);
  
  const handleSettingsChange = useCallback((key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleProfileChange = useCallback((key, value) => {
    setLocalProfile(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePrinterSettingsChange = useCallback((key, value) => {
    setLocalPrinterSettings(prev => ({ ...prev, [key]: value }));
  }, []);


  const handleImageUpload = async (file, fieldType) => {
    if (!file) return;
    const urlKey = `${fieldType}_url`;
    const currentUrl = localSettings[urlKey];
    const newUrl = await uploadImage(file, fieldType, currentUrl);
    if (newUrl) {
      handleSettingsChange(urlKey, newUrl);
    }
  };

  const handleRemoveImage = async (fieldType) => {
    const urlKey = `${fieldType}_url`;
    const currentUrl = localSettings[urlKey];
    if (currentUrl) {
      await removeImage(currentUrl);
      handleSettingsChange(urlKey, null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToUpdate = {};
      const profileUpdates = {};
      const printerSettingsUpdates = {};

      Object.keys(localSettings).forEach(key => {
        if (localSettings[key] !== businessSettings?.[key]) {
          settingsToUpdate[key] = localSettings[key];
        }
      });
      
      Object.keys(localProfile).forEach(key => {
        if (localProfile[key] !== user?.[key]) {
          profileUpdates[key] = localProfile[key];
        }
      });

      Object.keys(localPrinterSettings).forEach(key => {
        if (localPrinterSettings[key] !== printerSettings?.[key]) {
            printerSettingsUpdates[key] = localPrinterSettings[key];
        }
      });

      const promises = [];
      if (Object.keys(settingsToUpdate).length > 0) {
        promises.push(updateBusinessSettings(settingsToUpdate));
      }
      if (Object.keys(profileUpdates).length > 0) {
        promises.push(updateUserProfileAndAuth(profileUpdates));
      }
      if (Object.keys(printerSettingsUpdates).length > 0) {
        promises.push(updatePrinterSettings(printerSettingsUpdates));
      }
      
      if (promises.length > 0) {
        await Promise.all(promises);
        toast({
          title: "Sucesso!",
          description: "Suas configurações foram salvas.",
        });
      } else {
        toast({
          title: "Nenhuma alteração",
          description: "Não havia nada para salvar.",
        });
      }

    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const combinedFormData = useMemo(() => {
    return {
      ...businessSettings,
      ...user,
      ...localSettings,
      ...localProfile,
    };
  }, [localSettings, localProfile, businessSettings, user]);
  
  const businessSlug = user?.business_slug;

  const isLoading = loadingData || authLoading;

  if (isLoading && !businessSettings) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-red-500" /></div>;
  }
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as informações e preferências do seu negócio.</p>
      </div>
      <CatalogLinkSection 
        businessSlug={businessSlug}
        isLoading={isLoading}
      />
      <Tabs defaultValue="business_info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business_info">Negócio</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="delivery">Entrega</TabsTrigger>
          <TabsTrigger value="printing">Impressão</TabsTrigger>
        </TabsList>
        <TabsContent value="business_info">
          <Card>
            <BusinessInfoSection 
              formData={combinedFormData}
              onProfileChange={handleProfileChange}
              onSettingsChange={handleSettingsChange}
            />
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSave} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
           <Card>
            <CardHeader>
              <CardTitle>Aparência do Catálogo</CardTitle>
              <CardDescription>Personalize o logo e o banner do seu catálogo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AppearanceSection
                logo={localSettings.logo_url}
                banner={localSettings.banner_url}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                logoInputRef={logoInputRef}
                bannerInputRef={bannerInputRef}
                uploadingLogo={uploadingImage}
                uploadingBanner={uploadingImage}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSave} disabled={isSaving || uploadingImage}>
                {isSaving || uploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving || uploadingImage ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="delivery">
          <DeliveryZonesSection 
            deliveryZones={deliveryZones}
            onAdd={addDeliveryZone}
            onUpdate={updateDeliveryZone}
            onDelete={deleteDeliveryZone}
          />
        </TabsContent>
        <TabsContent value="printing">
            <PrintingSection 
              settings={localPrinterSettings} 
              onChange={handlePrinterSettingsChange} 
              onSave={handleSave}
              isSaving={isSaving}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings;