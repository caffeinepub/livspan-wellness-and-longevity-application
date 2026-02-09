import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChronographDial from './ChronographDial';

interface FastingTimerProps {
  fastingHours: number;
  onFastingDurationChange: (durationHours: number) => void;
}

export default function FastingTimer({ fastingHours, onFastingDurationChange }: FastingTimerProps) {
  return (
    <Card className="glass-panel shadow-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <img src="/assets/generated/fasting-timer-transparent.dim_64x64.png" alt="Fasting" className="h-8 w-8 drop-shadow-md" />
          <CardTitle className="text-lg">Fasting Timer</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <ChronographDial
            value={fastingHours}
            min={0}
            max={24}
            step={0.5}
            onChange={onFastingDurationChange}
            label="Fasting Hours"
            unit="h"
            size={200}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {fastingHours >= 16 
            ? (fastingHours >= 20 ? '⚡ Extended fasting' : '✓ Optimal fasting window')
            : '→ Build up to 16h for autophagy'}
        </p>
      </CardContent>
    </Card>
  );
}
