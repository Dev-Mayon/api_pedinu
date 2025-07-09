import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const useImageUpload = (user, toast) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file, folder, oldUrl = null) => {
    if (!user?.id) {
      toast({ title: "Erro de Autenticação", description: "Usuário não encontrado.", variant: "destructive" });
      return null;
    }

    if (oldUrl) {
      try {
        const oldPath = oldUrl.split('/business-images/')[1];
        if (oldPath) {
          await supabase.storage.from('business-images').remove([oldPath]);
        }
      } catch (err) {
        console.warn("Falha ao remover imagem antiga:", err);
      }
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${uuidv4()}.${fileExt}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);
      
      toast({ title: "Upload realizado!", description: "Imagem enviada com sucesso." });
      return publicUrl;

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const removeImage = async (imageUrl) => {
    if (!imageUrl) return;
    setUploading(true);
    try {
      const oldPath = imageUrl.split('/business-images/')[1];
      if (oldPath) {
        await supabase.storage.from('business-images').remove([oldPath]);
        toast({ title: "Imagem removida!" });
      }
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast({ title: "Erro ao remover imagem", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadImage,
    removeImage
  };
};