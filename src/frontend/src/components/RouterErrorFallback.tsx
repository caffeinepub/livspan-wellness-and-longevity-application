import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface RouterErrorFallbackProps {
  error?: Error | unknown;
  reset?: () => void;
}

export default function RouterErrorFallback({ error }: RouterErrorFallbackProps) {
  // Safely log error to console for debugging
  try {
    if (error) {
      console.error('Router error:', error);
      if (error instanceof Error && error.stack) {
        console.error('Error stack:', error.stack);
      }
    }
  } catch (logError) {
    console.error('Error logging failed:', logError);
  }

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 px-4 py-8">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while loading the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Please try reloading the page. If the problem persists, contact support.
          </p>
          <Button onClick={handleReload} className="w-full" variant="default">
            Reload Application
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
