import { motion } from "framer-motion";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  showSkeleton?: boolean;
}

export function PageLoader({ message = "Ładowanie...", showSkeleton = true }: PageLoaderProps) {
  if (showSkeleton) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background"
      >
        <PageSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex items-center justify-center"
    >
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
        </div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
}
