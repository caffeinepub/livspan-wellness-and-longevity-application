import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Variant_de_en } from '../backend';
import TokenWallet from '../components/TokenWallet';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, Award, Vault, RefreshCw } from 'lucide-react';

export default function WalletPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const isGerman = userProfile?.preferences.language === Variant_de_en.de;

  return (
    <div className="min-h-screen adaptive-gradient-midday">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LIV Wallet
            </h2>
            <Badge variant="outline" className="text-sm">
              <LinkIcon className="h-4 w-4 mr-1" />
              ICRC-1
            </Badge>
          </div>
          <p className="text-muted-foreground mb-4">
            {isGerman 
              ? 'Verwalten Sie Ihre on-chain LIV-Token und dezentrale Transaktionen auf der Internet Computer Blockchain mit dem finalen LivSpan Ecosystem 3.0 Finale Dual-Pool-System' 
              : 'Manage your on-chain LIV tokens and decentralized transactions on the Internet Computer blockchain with the final LivSpan Ecosystem 3.0 Finale dual-pool system'}
          </p>
          
          {/* Ecosystem 3.0 Finale Features - Final Dual-Pool Redistribution */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg border border-border/40 bg-background/50 p-3">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-xs">
                {isGerman ? 'Finale Neuverteilung' : 'Final Redistribution'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg border border-border/40 bg-background/50 p-3">
              <Vault className="h-4 w-4 text-primary" />
              <span className="text-xs">
                {isGerman ? '40% Treasury' : '40% Treasury'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg border border-border/40 bg-background/50 p-3">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-xs">
                {isGerman ? '60% Belohnungen' : '60% Rewards'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg border border-border/40 bg-background/50 p-3">
              <LinkIcon className="h-4 w-4 text-secondary" />
              <span className="text-xs">
                {isGerman ? '21M LIV Fest' : '21M LIV Fixed'}
              </span>
            </div>
          </div>
        </div>

        <TokenWallet />
      </div>
    </div>
  );
}
