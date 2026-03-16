import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, BookText, Megaphone, Brain } from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold gradient-text">
            Demo Platformy Hardban Records
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="music" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="music">
              <Music className="w-4 h-4 mr-2" />
              Muzyka
            </TabsTrigger>
            <TabsTrigger value="publishing">
              <BookText className="w-4 h-4 mr-2" />
              Publikacje
            </TabsTrigger>
            <TabsTrigger value="marketing">
              <Megaphone className="w-4 h-4 mr-2" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="w-4 h-4 mr-2" />
              AI Studio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="music" className="space-y-4">
            <div className="aspect-video bg-gradient-subtle rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <Music className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-2">Moduł Muzyczny</h3>
                <p className="text-muted-foreground">
                  Dystrybuuj muzykę na 38+ platformach streamingowych via RouteNote
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Automatyczna dystrybucja</h4>
                <p className="text-sm text-muted-foreground">
                  Jeden upload, wszystkie platformy - Spotify, Apple Music, YouTube Music i więcej
                </p>
              </div>
              <div className="glass-dark p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Zarządzanie prawami</h4>
                <p className="text-sm text-muted-foreground">
                  Split sheets, royalties tracking, automatyczne wypłaty dla współpracowników
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publishing" className="space-y-4">
            <div className="aspect-video bg-gradient-subtle rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <BookText className="w-16 h-16 mx-auto mb-4 text-secondary" />
                <h3 className="text-2xl font-bold mb-2">Moduł Publikacji</h3>
                <p className="text-muted-foreground">
                  Publikuj e-booki i audiobooki w globalnych księgarniach
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Generator audiobooków AI</h4>
                <p className="text-sm text-muted-foreground">
                  Konwertuj e-booki na audiobooki z naturalnymi głosami AI w 40+ językach
                </p>
              </div>
              <div className="glass-dark p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Globalna dystrybucja</h4>
                <p className="text-sm text-muted-foreground">
                  Amazon Kindle, Apple Books, Google Play Books i więcej
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-4">
            <div className="aspect-video bg-gradient-subtle rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h3 className="text-2xl font-bold mb-2">Moduł Marketingu</h3>
                <p className="text-muted-foreground">
                  AI-powered kampanie marketingowe dla Twoich wydań
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Generator strategii AI</h4>
                <p className="text-sm text-muted-foreground">
                  Automatyczne plany marketingowe dostosowane do Twojego produktu
                </p>
              </div>
              <div className="glass-dark p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Smart links & Bio pages</h4>
                <p className="text-sm text-muted-foreground">
                  Jeden link do wszystkich platform streamingowych i sklepów
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="aspect-video bg-gradient-subtle rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-2">AI Creative Studio</h3>
                <p className="text-muted-foreground">
                  Twoje centrum kreatywne napędzane sztuczną inteligencją
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Generowanie treści</h4>
                <p className="text-sm text-muted-foreground">
                  Opisy, posty social media, press releases - wszystko AI-powered
                </p>
              </div>
              <div className="glass-dark p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Audio mastering</h4>
                <p className="text-sm text-muted-foreground">
                  Profesjonalny mastering za pomocą AI w kilka sekund
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
