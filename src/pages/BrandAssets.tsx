import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image, Plus, ArrowLeft, Loader2, Trash2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { 
  validateFileForUpload, 
  generateSafeFilename,
  BRAND_ASSET_ALLOWED_TYPES,
  MAX_FILE_SIZES 
} from "@/lib/fileValidation";

export default function BrandAssets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadAssets();
    }
  }, [user]);

  const loadAssets = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.storage
        .from("brand-assets")
        .list(user.id);

      if (error) throw error;

      const assetsWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from("brand-assets")
            .getPublicUrl(`${user.id}/${file.name}`);

          return {
            ...file,
            url: urlData.publicUrl,
          };
        })
      );

      setAssets(assetsWithUrls);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error loading assets:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!user) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      // Validate file before upload (server-side style validation on client)
      const validation = await validateFileForUpload(
        file,
        BRAND_ASSET_ALLOWED_TYPES,
        MAX_FILE_SIZES.brandAsset
      );

      if (!validation.valid) {
        throw new Error(validation.error || "Nieprawidłowy plik");
      }

      // Generate safe filename
      const safeFilename = generateSafeFilename(file.name);
      const filePath = `${user.id}/${safeFilename}`;

      const { error } = await supabase.storage
        .from("brand-assets")
        .upload(filePath, file);

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Plik został przesłany",
      });

      loadAssets();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Wystąpił błąd podczas przesyłania pliku",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.storage
        .from("brand-assets")
        .remove([`${user.id}/${fileName}`]);

      if (error) throw error;

      toast({
        title: "Usunięto",
        description: "Plik został usunięty",
      });

      loadAssets();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadAsset = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do panelu
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Assety Brandowe</h1>
              <p className="text-muted-foreground">
                Zarządzaj logo, grafikami i materiałami marki
              </p>
            </div>
            <div>
              <Input
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                id="asset-upload"
              />
              <label htmlFor="asset-upload">
                <Button variant="gradient" disabled={uploading} asChild>
                  <span className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Przesyłanie...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj Asset
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-dark border-white/10 hover:shadow-glow transition-all duration-300">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-secondary/20 rounded-t-lg overflow-hidden flex items-center justify-center">
                      {asset.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="font-medium text-sm truncate mb-2">{asset.name}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {(asset.metadata?.size / 1024).toFixed(2)} KB
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadAsset(asset.url, asset.name)}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Pobierz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(asset.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {assets.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Brak assetów</h3>
                <p className="text-muted-foreground mb-4">
                  Prześlij swoje logo, grafiki i materiały brandowe
                </p>
                <label htmlFor="asset-upload">
                  <Button variant="gradient" asChild>
                    <span className="cursor-pointer">
                      <Plus className="mr-2 h-4 w-4" />
                      Dodaj Pierwszy Asset
                    </span>
                  </Button>
                </label>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
