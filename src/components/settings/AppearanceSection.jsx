import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUploadSection from '@/components/settings/ImageUploadSection';

const AppearanceSection = ({ 
  logo, 
  banner, 
  onImageUpload, 
  onRemoveImage, 
  logoInputRef, 
  bannerInputRef,
  uploadingLogo,
  uploadingBanner
}) => (
  <>
    <ImageUploadSection
      title="Logo do Estabelecimento"
      description="Use uma imagem quadrada (ex: PNG, JPG). Máximo 2MB."
      currentImage={logo}
      onImageUpload={(e) => onImageUpload(e.target.files[0], 'logo')}
      onRemoveImage={() => onRemoveImage('logo')}
      inputRef={logoInputRef}
      fieldType="logo"
      isUploading={uploadingLogo}
      previewClassName="w-20 h-20"
    />
    
    <ImageUploadSection
      title="Banner (Capa do Catálogo)"
      description="Recomendado: imagem retangular (ex: 1200x400 pixels). Máximo 2MB."
      currentImage={banner}
      onImageUpload={(e) => onImageUpload(e.target.files[0], 'banner')}
      onRemoveImage={() => onRemoveImage('banner')}
      inputRef={bannerInputRef}
      fieldType="banner"
      isUploading={uploadingBanner}
      previewClassName="w-full h-32 sm:h-40"
    />
  </>
);

export default AppearanceSection;