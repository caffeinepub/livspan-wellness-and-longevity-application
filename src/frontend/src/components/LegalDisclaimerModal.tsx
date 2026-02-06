import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useSetLegalDisclaimerSeen } from '../hooks/useQueries';
import { toast } from 'sonner';

interface LegalDisclaimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFirstLaunch?: boolean;
}

export default function LegalDisclaimerModal({ open, onOpenChange, isFirstLaunch = false }: LegalDisclaimerModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const { mutate: setDisclaimerSeen, isPending } = useSetLegalDisclaimerSeen();

  const handleAccept = () => {
    if (isFirstLaunch) {
      setDisclaimerSeen(undefined, {
        onSuccess: () => {
          toast.success('Disclaimer acknowledged');
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error('Failed to save acknowledgment: ' + error.message);
        },
      });
    } else {
      onOpenChange(false);
    }
  };

  const canClose = !isFirstLaunch || acknowledged;

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => !canClose && e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Legal Disclaimer / Rechtlicher Hinweis</DialogTitle>
              <DialogDescription>Important information about using this app</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">English</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This app does not provide medical advice. All content is for informational purposes only. Always consult
                your physician or other qualified healthcare provider before making changes to your diet, training, or
                supplementation.
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Deutsch</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Dies ist keine medizinische Beratung. Alle Angaben dienen ausschließlich Informationszwecken.
                Konsultieren Sie unbedingt Ihren Arzt oder andere qualifizierte Gesundheitsfachkräfte, bevor Sie
                Änderungen an Ihrer Ernährung, Ihrem Training oder Ihrer Supplementierung vornehmen.
              </p>
            </div>
          </div>

          {isFirstLaunch && (
            <div className="flex items-start space-x-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="acknowledge"
                  className="cursor-pointer text-sm font-medium leading-relaxed text-foreground"
                >
                  Verstanden / Understood
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  I acknowledge that I have read and understood this disclaimer
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {isFirstLaunch ? (
            <Button onClick={handleAccept} disabled={!acknowledged || isPending} className="w-full">
              {isPending ? 'Processing...' : 'Continue / Fortfahren'}
            </Button>
          ) : (
            <Button onClick={handleAccept} variant="outline" className="w-full">
              Close / Schließen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
