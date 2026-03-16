import { useServiceWorker } from '@/hooks/useServiceWorker';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Komponent wskaźnika trybu offline
 * Pokazuje banner gdy użytkownik jest offline
 */
export const OfflineIndicator = () => {
  const { isOnline, updateAvailable, updateServiceWorker } = useServiceWorker();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2"
        >
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            Jesteś offline. Niektóre funkcje mogą być niedostępne.
          </span>
        </motion.div>
      )}

      {updateAvailable && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-2 flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm font-medium">
            Dostępna nowa wersja aplikacji.
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={updateServiceWorker}
            className="ml-2"
          >
            Aktualizuj
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
