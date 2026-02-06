import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetLegalDisclaimerStatus } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import WalletPage from './pages/WalletPage';
import AnalysisPage from './pages/AnalysisPage';
import JournalPage from './pages/JournalPage';
import ProfileSetup from './components/ProfileSetup';
import LoginScreen from './components/LoginScreen';
import LegalDisclaimerModal from './components/LegalDisclaimerModal';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

function Layout() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { data: disclaimerStatus } = useGetLegalDisclaimerStatus();
  const showFirstLaunchDisclaimer = disclaimerStatus && !disclaimerStatus.hasSeenDisclaimer;

  return (
    <div className="flex min-h-screen flex-col">
      <Header onShowDisclaimer={() => setShowDisclaimer(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LegalDisclaimerModal
        open={showFirstLaunchDisclaimer || showDisclaimer}
        onOpenChange={setShowDisclaimer}
        isFirstLaunch={showFirstLaunchDisclaimer}
      />
    </div>
  );
}

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: disclaimerStatus, isLoading: disclaimerLoading, isFetched: disclaimerFetched } = useGetLegalDisclaimerStatus();

  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <div className="min-h-screen">
        <ProfileSetup />
      </div>
    );
  }

  if (profileLoading || !isFetched || disclaimerLoading || !disclaimerFetched) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
      </div>
    );
  }

  return <Layout />;
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
  component: WalletPage,
});

const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analysis',
  component: AnalysisPage,
});

const journalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/journal',
  component: JournalPage,
});

const routeTree = rootRoute.addChildren([indexRoute, walletRoute, analysisRoute, journalRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
