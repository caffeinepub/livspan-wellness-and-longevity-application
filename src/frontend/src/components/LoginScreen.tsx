import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight luxury-text-gold">LivSpan</h1>
            <p className="mt-2 text-xl text-muted-foreground">Decode your Longevity</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground max-w-md">
            Track your wellness journey with AI-powered insights. Monitor autophagy, longevity scores, and earn LIV tokens for healthy habits.
          </p>
          
          <Button size="lg" onClick={login} disabled={isLoggingIn} className="mt-4 px-8">
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              'Login to Start'
            )}
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 opacity-60">
          <div className="flex flex-col items-center gap-2">
            <img src="/assets/generated/autophagy-icon-transparent.dim_64x64.png" alt="Autophagy" className="h-12 w-12" />
            <span className="text-xs text-muted-foreground">Autophagy Score</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img src="/assets/generated/longevity-icon-transparent.dim_64x64.png" alt="Longevity" className="h-12 w-12" />
            <span className="text-xs text-muted-foreground">Longevity Score</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img src="/assets/generated/liv-token-transparent.dim_64x64.png" alt="LIV Token" className="h-12 w-12" />
            <span className="text-xs text-muted-foreground">LIV Rewards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
