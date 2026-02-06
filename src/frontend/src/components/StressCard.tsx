import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StepperInput from './StepperInput';
import { Activity } from 'lucide-react';
import { ColorIndicator } from '../backend';

interface StressCardProps {
  isGerman: boolean;
  systolic: number;
  diastolic: number;
  pulse: number;
  onSystolicChange: (value: number) => void;
  onDiastolicChange: (value: number) => void;
  onPulseChange: (value: number) => void;
}

export default function StressCard({
  isGerman,
  systolic,
  diastolic,
  pulse,
  onSystolicChange,
  onDiastolicChange,
  onPulseChange,
}: StressCardProps) {
  const getColorIndicator = (): ColorIndicator => {
    const bpNormal = systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80;
    const bpMild = (systolic >= 80 && systolic < 90) || (systolic > 120 && systolic <= 140) ||
                   (diastolic >= 50 && diastolic < 60) || (diastolic > 80 && diastolic <= 90);
    
    const pulseNormal = pulse >= 60 && pulse <= 80;
    const pulseMild = (pulse >= 50 && pulse < 60) || (pulse > 80 && pulse <= 100);

    if (bpNormal && pulseNormal) return ColorIndicator.green;
    if ((bpNormal || bpMild) && (pulseNormal || pulseMild)) return ColorIndicator.yellow;
    return ColorIndicator.red;
  };

  const colorIndicator = getColorIndicator();

  const getIndicatorColor = () => {
    switch (colorIndicator) {
      case ColorIndicator.green:
        return 'bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400';
      case ColorIndicator.yellow:
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-600 dark:text-yellow-400';
      case ColorIndicator.red:
        return 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400';
    }
  };

  const getStatusText = () => {
    switch (colorIndicator) {
      case ColorIndicator.green:
        return isGerman ? 'Normal' : 'Normal';
      case ColorIndicator.yellow:
        return isGerman ? 'Leichte Abweichung' : 'Mild Deviation';
      case ColorIndicator.red:
        return isGerman ? 'Signifikante Abweichung' : 'Significant Deviation';
    }
  };

  return (
    <Card className="glass-panel shadow-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary drop-shadow-md" />
          <CardTitle className="text-lg">
            {isGerman ? 'Stress-Tracking' : 'Stress Tracking'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Systolic BP */}
          <div className="space-y-3">
            <StepperInput
              value={systolic}
              onChange={onSystolicChange}
              min={80}
              max={180}
              step={1}
              unit="mmHg"
              label={isGerman ? 'Systolisch' : 'Systolic'}
            />
          </div>

          {/* Diastolic BP */}
          <div className="space-y-3">
            <StepperInput
              value={diastolic}
              onChange={onDiastolicChange}
              min={50}
              max={120}
              step={1}
              unit="mmHg"
              label={isGerman ? 'Diastolisch' : 'Diastolic'}
            />
          </div>

          {/* Pulse */}
          <div className="space-y-3">
            <StepperInput
              value={pulse}
              onChange={onPulseChange}
              min={40}
              max={150}
              step={1}
              unit="bpm"
              label={isGerman ? 'Puls' : 'Pulse'}
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className={`rounded-lg border p-3 backdrop-blur-sm ${getIndicatorColor()}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {isGerman ? 'Status' : 'Status'}
            </span>
            <span className="text-sm font-bold">{getStatusText()}</span>
          </div>
          <p className="mt-1 text-xs opacity-80">
            {systolic}/{diastolic} mmHg • {pulse} bpm
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
