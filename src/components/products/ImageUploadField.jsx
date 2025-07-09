import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const ImageUploadField = ({ value, onChange, label = "Imagem do Produto" }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadImageToStorage = async (file) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/products/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('business-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('business-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Selecione uma imagem (JPEG, PNG, etc.).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      let imageUrl;
      
      try {
        imageUrl = await uploadImageToStorage(file);
        toast({
          title: "Upload realizado!",
          description: "Imagem enviada com sucesso."
        });
      } catch (storageError) {
        console.warn('Falha no upload para Storage, usando base64:', storageError);
        imageUrl = await convertToBase64(file);
        toast({
          title: "Imagem carregada!",
          description: "Imagem carregada localmente."
        });
      }

      onChange(imageUrl);

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative">
          <div className="w-full h-32 bg-gray-100 border-2 border-gray-200 rounded-lg overflow-hidden">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-red-400 bg-red-50' 
              : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            
            <div className="text-sm text-gray-600">
              {uploading ? (
                <span>Enviando imagem...</span>
              ) : (
                <>
                  <span className="font-medium text-red-600">Clique para enviar</span>
                  <span> ou arraste uma imagem aqui</span>
                </>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF até 5MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;