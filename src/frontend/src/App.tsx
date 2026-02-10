import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetLegalDisclaimerStatus } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet, ErrorComponent, useNavigate } from '@tanstack/react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import WalletPage from './pages/WalletPage';
import AnalysisPage from './pages/AnalysisPage';
import JournalPage from './pages/JournalPage';
import ProfileSetup from './components/ProfileSetup';
import LoginScreen from './components/LoginScreen';
import LegalDisclaimerModal from './components/LegalDisclaimerModal';
import RouterErrorFallback from './components/RouterErrorFallback';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError } = useGetCallerUserProfile();
  const { data: disclaimerStatus, isLoading: disclaimerLoading, isFetched: disclaimerFetched, error: disclaimerError } = useGetLegalDisclaimerStatus();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  // Log errors to console but don't crash
  useEffect(() => {
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }
    if (disclaimerError) {
      console.error('Disclaimer fetch error:', disclaimerError);
    }
  }, [profileError, disclaimerError]);

  // Redirect to dashboard after successful login
  useEffect(() => {
    if (isAuthenticated && !isInitializing && isFetched && disclaimerFetched && userProfile !== null) {
      // User is authenticated and has a profile - ensure we're on dashboard
      navigate({ to: '/', replace: true }).catch((err) => {
        console.error('Navigation error:', err);
      });
    }
  }, [isAuthenticated, isInitializing, isFetched, disclaimerFetched, userProfile, navigate]);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Layout />;
}

const rootRoute = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error }) => <RouterErrorFallback error={error} />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
  errorComponent: ({ error }) => <RouterErrorFallback error={error} />,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
  component: WalletPage,
  errorComponent: ({ error }) => <RouterErrorFallback error={error} />,
});

const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analysis',
  component: AnalysisPage,
  errorComponent: ({ error }) => <RouterErrorFallback error={error} />,
});

const journalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/journal',
  component: JournalPage,
  errorComponent: ({ error }) => <RouterErrorFallback error={error} />,
});

const routeTree = rootRoute.addChildren([indexRoute, walletRoute, analysisRoute, journalRoute]);

const router = createRouter({ 
  routeTree,
  defaultErrorComponent: ({ error }) => <RouterErrorFallback error={error} />,
});

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
