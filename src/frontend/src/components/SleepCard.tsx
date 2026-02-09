import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChronographDial from './ChronographDial';
import StepperInput from './StepperInput';
import { Moon } from 'lucide-react';

interface SleepCardProps {
  isGerman: boolean;
  sleepDuration: number;
  sleepQuality: number;
  onSleepDurationChange: (duration: number) => void;
  onSleepQualityChange: (quality: number) => void;
}

export default function SleepCard({
  isGerman,
  sleepDuration,
  sleepQuality,
  onSleepDurationChange,
  onSleepQualityChange,
}: SleepCardProps) {
  const getQualityLabel = (quality: number) => {
    if (quality >= 8) return isGerman ? 'Ausgezeichnet' : 'Excellent';
    if (quality >= 6) return isGerman ? 'Gut' : 'Good';
    if (quality >= 4) return isGerman ? 'Mäßig' : 'Fair';
    return isGerman ? 'Schlecht' : 'Poor';
  };

  return (
    <Card className="glass-panel shadow-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Moon className="h-6 w-6 text-primary drop-shadow-md" />
          <CardTitle className="text-lg">
            {isGerman ? 'Schlaf-Tracking' : 'Sleep Tracking'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Sleep Duration - Stepper */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {isGerman ? 'Schlafdauer' : 'Sleep Duration'}
              </span>
              <span className="text-sm text-muted-foreground">{getQualityLabel(sleepQuality)}</span>
            </div>
            <StepperInput
              value={sleepDuration}
              onChange={onSleepDurationChange}
              min={0}
              max={10}
              step={0.5}
              unit="h"
            />
          </div>

          {/* Sleep Quality - Dial */}
          <div className="space-y-3">
            <div className="flex justify-center pt-2">
              <ChronographDial
                value={sleepQuality}
                min={0}
                max={10}
                step={1}
                onChange={onSleepQualityChange}
                label={isGerman ? 'Schlafqualität' : 'Sleep Quality'}
                unit="/10"
                size={180}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
