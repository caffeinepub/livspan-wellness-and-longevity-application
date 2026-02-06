import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetTokenBalance } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Coins, Home, Wallet, Menu, BarChart3, BookOpen } from 'lucide-react';
import { useState } from 'react';
import SettingsDialog from './SettingsDialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface HeaderProps {
  onShowDisclaimer: () => void;
}

export default function Header({ onShowDisclaimer }: HeaderProps) {
  const { clear } = useInternetIdentity();
  const { data: tokenBalance } = useGetTokenBalance();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-luxury-gold/20 glass-panel shadow-glass">
        <div className="container px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-luxury-gold/30 bg-luxury-gold/5 hover:bg-luxury-gold/10 transition-all duration-200 hover:scale-110 shadow-glow-sm"
                  >
                    <Menu className="h-5 w-5 text-luxury-gold" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] glass-panel border-r border-luxury-gold/20">
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="mb-4 pb-4 border-b border-luxury-gold/20">
                      <h2 className="text-lg font-bold luxury-text-gold">
                        Navigation
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">Luxury Health Coach</p>
                    </div>
                    
                    <Button
                      variant={currentPath === '/' ? 'default' : 'ghost'}
                      onClick={() => handleNavigation('/')}
                      className="justify-start gap-3 transition-all duration-200 hover:scale-105 h-11"
                    >
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Button>
                    
                    <Button
                      variant={currentPath === '/analysis' ? 'default' : 'ghost'}
                      onClick={() => handleNavigation('/analysis')}
                      className="justify-start gap-3 transition-all duration-200 hover:scale-105 h-11"
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span>Analyse / Analysis</span>
                    </Button>
                    
                    <Button
                      variant={currentPath === '/journal' ? 'default' : 'ghost'}
                      onClick={() => handleNavigation('/journal')}
                      className="justify-start gap-3 transition-all duration-200 hover:scale-105 h-11"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Tagebuch / Journal</span>
                    </Button>
                    
                    <Button
                      variant={currentPath === '/wallet' ? 'default' : 'ghost'}
                      onClick={() => handleNavigation('/wallet')}
                      className="justify-start gap-3 transition-all duration-200 hover:scale-105 h-11"
                    >
                      <Wallet className="h-5 w-5" />
                      <span>LIV Wallet</span>
                    </Button>
                    
                    <div className="border-t border-luxury-gold/20 my-2" />
                    
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowSettings(true);
                        setMenuOpen(false);
                      }}
                      className="justify-start gap-3 transition-all duration-200 hover:scale-105 h-11"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Einstellungen / Settings</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start gap-3 transition-all duration-200 hover:scale-105 h-11 text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Abmelden / Logout</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <img src="/assets/MagicEraser_251230_145221.png" alt="LivSpan Logo" className="h-12 w-12 drop-shadow-lg" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold luxury-text-gold">LivSpan</h1>
                <p className="text-xs text-muted-foreground">Luxury Health Coach</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-luxury-gold/30 luxury-gradient-gold backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 shadow-glow-sm">
                <Coins className="h-4 w-4 text-luxury-gold-bright" />
                <span className="text-sm font-semibold text-foreground">{tokenBalance || 0}</span>
                <span className="text-xs text-muted-foreground">LIV</span>
              </div>

              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="hidden sm:flex transition-all duration-200 hover:scale-110">
                <Settings className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex transition-all duration-200 hover:scale-110">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="hidden sm:flex h-12 items-center border-t border-luxury-gold/20">
            <nav className="flex items-center gap-2">
              <Button
                variant={currentPath === '/' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/' })}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentPath === '/analysis' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/analysis' })}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                <BarChart3 className="h-4 w-4" />
                Analyse / Analysis
              </Button>
              <Button
                variant={currentPath === '/journal' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/journal' })}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                <BookOpen className="h-4 w-4" />
                Tagebuch / Journal
              </Button>
              <Button
                variant={currentPath === '/wallet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/wallet' })}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                <Wallet className="h-4 w-4" />
                LIV Wallet
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} onShowDisclaimer={onShowDisclaimer} />
    </>
  );
}
