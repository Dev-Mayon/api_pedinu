import React from 'react';
import { X, Store, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ImageUploadSection = ({ 
  title, 
  description, 
  currentImage, 
  onImageUpload, 
  onRemoveImage, 
  inputRef, 
  fieldType,
  isUploading,
  previewClassName = "w-20 h-20"
}) => (
  <div>
    <Label htmlFor={`${fieldType}-upload`}>{title}</Label>
    <div className="flex items-center space-x-2 mt-1">
      <Input 
        id={`${fieldType}-upload`} 
        type="file" 
        accept="image/*" 
        ref={inputRef} 
        onChange={(e) => onImageUpload(e, fieldType)} 
        className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        disabled={isUploading}
      />
      {currentImage && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemoveImage(fieldType)} 
          className="text-red-500 hover:text-red-600"
          disabled={isUploading}
        >
          <X className="h-4 w-4 mr-1" /> Remover
        </Button>
      )}
    </div>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
    <div className="mt-3 p-2 border rounded-md inline-block bg-gray-50 border-gray-200">
      <p className="text-xs text-gray-500 mb-1">Pré-visualização:</p>
      <div className={`${previewClassName} rounded-md overflow-hidden border bg-white flex items-center justify-center text-gray-400 relative`}>
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : currentImage ? (
          <img src={currentImage} alt={title} className="max-w-full max-h-full object-contain" />
        ) : (
          fieldType === 'logo' ? <Store size={32} /> : <ImageIcon size={32} />
        )}
      </div>
    </div>
  </div>
);

export default ImageUploadSection;