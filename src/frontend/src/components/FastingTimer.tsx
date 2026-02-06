import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChronographDial from './ChronographDial';

interface FastingTimerProps {
  fastingHours: number;
  onFastingDurationChange: (durationHours: number) => void;
}

export default function FastingTimer({ fastingHours, onFastingDurationChange }: FastingTimerProps) {
  // Gradient stops for fasting: red (0-12h) → yellow (12-16h) → green (16-24h)
  const gradientStops = [
    { position: 0, color: 'oklch(0.55 0.22 25)' }, // red
    { position: 50, color: 'oklch(0.75 0.15 85)' }, // yellow
    { position: 67, color: 'oklch(0.60 0.16 155)' }, // green start
    { position: 100, color: 'oklch(0.65 0.14 175)' }, // turquoise end
  ];

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
            gradientStops={gradientStops}
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
