import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { setupGlobalErrorHandlers } from "@/lib/errorTracking";
import { queryClientConfig } from "@/hooks/useQueryCache";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";

// Lazy load heavy pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MusicDashboard = lazy(() => import("./pages/MusicDashboard"));
const AdminMusicReview = lazy(() => import("./pages/AdminMusicReview"));
const AIStudio = lazy(() => import("./pages/AIStudio"));
const StrategyGenerator = lazy(() => import("./pages/StrategyGenerator"));
const ContentGenerator = lazy(() => import("./pages/ContentGenerator"));
const PrometheusAI = lazy(() => import("./pages/PrometheusAI"));
const PrometheusAutomation = lazy(() => import("./pages/PrometheusAutomation"));
const PrometheusNewsroom = lazy(() => import("./pages/PrometheusNewsroom"));
const PrometheusPodcasts = lazy(() => import("./pages/PrometheusPodcasts"));

const PrometheusDistribution = lazy(() => import("./pages/PrometheusDistribution"));
const PitchDeck = lazy(() => import("./pages/PitchDeck"));
const PrometheusAPIs = lazy(() => import("./pages/PrometheusAPIs"));
const ContactsManager = lazy(() => import("./pages/ContactsManager"));
const PublicationCalendar = lazy(() => import("./pages/PublicationCalendar"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const RevenueTracker = lazy(() => import("./pages/RevenueTracker"));
const BrandAssets = lazy(() => import("./pages/BrandAssets"));
const ComprehensiveReport = lazy(() => import("./pages/ComprehensiveReport"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const MarketingDashboard = lazy(() => import("./pages/MarketingDashboard"));
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail"));

const queryClient = new QueryClient(queryClientConfig);

// Setup global error tracking
setupGlobalErrorHandlers();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OfflineIndicator />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CommandPalette />
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/artist/:username" element={
              <Suspense fallback={<PageLoader />}>
                <ArtistProfile />
              </Suspense>
            } />
            <Route path="/modules/:slug" element={
              <Suspense fallback={<PageLoader />}>
                <ModuleDetail />
              </Suspense>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/music" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <MusicDashboard />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/marketing" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <MarketingDashboard />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/music-review" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminMusicReview />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ai-studio" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <AIStudio />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/strategy-generator" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <StrategyGenerator />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/content-generator" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <ContentGenerator />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/contacts" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <ContactsManager />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/calendar" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <PublicationCalendar />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <AnalyticsDashboard />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/revenue" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <RevenueTracker />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/brand-assets" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <BrandAssets />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/prometheus-ai" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <PrometheusAI />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/prometheus-automation" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <PrometheusAutomation />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/prometheus-newsroom" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <PrometheusNewsroom />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/prometheus-podcasts" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <PrometheusPodcasts />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/prometheus-distribution" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <PrometheusDistribution />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/prometheus-apis" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <PrometheusAPIs />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/comprehensive-report" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <ComprehensiveReport />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/pitch-deck" element={
              <Suspense fallback={<PageLoader />}>
                <PitchDeck />
              </Suspense>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
