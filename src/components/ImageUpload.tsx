import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket: string;
  path?: string;
  className?: string;
}

const ImageUpload = ({ value, onChange, bucket, path = '', className = '' }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { t } = useI18n();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success(t('image.uploaded'));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(t('image.uploadError') + ': ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className={`space-y-4 w-full ${className}`}>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border">
            <img 
              src={value} 
              alt="Uploaded" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center bg-muted/30">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <span className="text-xs text-muted-foreground font-medium text-center px-4">
              {t('image.noImage')}
            </span>
          </div>
        )}

        <div className="flex-1">
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Label htmlFor="image-upload" className="cursor-pointer">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="w-full"
              asChild
            >
              <span>
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {value ? t('image.change') : t('image.upload')}
              </span>
            </Button>
          </Label>
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            {t('image.recommendation')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper for Label if not imported
const Label = ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

export default ImageUpload;
