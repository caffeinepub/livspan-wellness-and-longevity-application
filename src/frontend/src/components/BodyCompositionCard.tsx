import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StepperInput from './StepperInput';
import ChipsInput from './ChipsInput';
import { BMIIndicatorCategory } from '../backend';

interface BodyCompositionCardProps {
  isGerman: boolean;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  bmi: number | null;
  bmiCategory: BMIIndicatorCategory | null;
  onWeightChange: (value: number) => void;
  onBodyFatChange: (value: number) => void;
  onMuscleMassChange: (value: number) => void;
}

export default function BodyCompositionCard({
  isGerman,
  weight,
  bodyFat,
  muscleMass,
  bmi,
  bmiCategory,
  onWeightChange,
  onBodyFatChange,
  onMuscleMassChange,
}: BodyCompositionCardProps) {
  const getBMIColor = () => {
    if (!bmiCategory) return 'text-muted-foreground';
    
    switch (bmiCategory) {
      case BMIIndicatorCategory.optimal:
        return 'text-green-600 dark:text-green-400';
      case BMIIndicatorCategory.slightlyHigh:
      case BMIIndicatorCategory.slightlyLow:
        return 'text-yellow-600 dark:text-yellow-400';
      case BMIIndicatorCategory.tooHigh:
      case BMIIndicatorCategory.tooLow:
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getBMILabel = () => {
    if (!bmiCategory) return '';
    
    const labels = {
      [BMIIndicatorCategory.optimal]: isGerman ? 'Optimal' : 'Optimal',
      [BMIIndicatorCategory.slightlyHigh]: isGerman ? 'Leicht erhöht' : 'Slightly High',
      [BMIIndicatorCategory.slightlyLow]: isGerman ? 'Leicht niedrig' : 'Slightly Low',
      [BMIIndicatorCategory.tooHigh]: isGerman ? 'Deutlich zu hoch' : 'Too High',
      [BMIIndicatorCategory.tooLow]: isGerman ? 'Deutlich zu niedrig' : 'Too Low',
    };
    
    return labels[bmiCategory] || '';
  };

  const getBMIBackgroundColor = () => {
    if (!bmiCategory) return 'bg-muted/20';
    
    switch (bmiCategory) {
      case BMIIndicatorCategory.optimal:
        return 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30';
      case BMIIndicatorCategory.slightlyHigh:
      case BMIIndicatorCategory.slightlyLow:
        return 'bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/30';
      case BMIIndicatorCategory.tooHigh:
      case BMIIndicatorCategory.tooLow:
        return 'bg-red-500/10 dark:bg-red-500/20 border-red-500/30';
      default:
        return 'bg-muted/20';
    }
  };

  const weightPresets = [
    { label: '+0.5kg', value: 0.5 },
    { label: '+1kg', value: 1 },
    { label: '-0.5kg', value: -0.5 },
  ];

  const bodyFatPresets = [
    { label: '+0.5%', value: 0.5 },
    { label: '+1%', value: 1 },
    { label: '-0.5%', value: -0.5 },
  ];

  const muscleMassPresets = [
    { label: '+0.5kg', value: 0.5 },
    { label: '+1kg', value: 1 },
    { label: '-0.5kg', value: -0.5 },
  ];

  return (
    <Card className="glass-panel shadow-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">
              {isGerman ? 'Körperzusammensetzung' : 'Body Composition'}
            </CardTitle>
          </div>
          {bmi !== null && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getBMIBackgroundColor()}`}>
              <span className="text-xs text-muted-foreground font-medium">
                {isGerman ? 'BMI' : 'BMI'}:
              </span>
              <span className={`font-mono text-sm font-bold ${getBMIColor()}`}>
                {bmi.toFixed(1)}
              </span>
              <span className={`text-xs font-medium ${getBMIColor()}`}>
                {getBMILabel()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Weight */}
          <div className="space-y-3">
            <StepperInput
              value={weight}
              onChange={onWeightChange}
              min={30}
              max={200}
              step={0.1}
              unit="kg"
              label={isGerman ? 'Körpergewicht' : 'Body Weight'}
            />
            <ChipsInput
              presets={weightPresets}
              onSelect={(value) => onWeightChange(Math.max(30, Math.min(200, weight + value)))}
            />
          </div>

          {/* Body Fat */}
          <div className="space-y-3">
            <StepperInput
              value={bodyFat}
              onChange={onBodyFatChange}
              min={5}
              max={50}
              step={0.1}
              unit="%"
              label={isGerman ? 'Körperfettanteil' : 'Body Fat %'}
            />
            <ChipsInput
              presets={bodyFatPresets}
              onSelect={(value) => onBodyFatChange(Math.max(5, Math.min(50, bodyFat + value)))}
            />
          </div>

          {/* Muscle Mass */}
          <div className="space-y-3">
            <StepperInput
              value={muscleMass}
              onChange={onMuscleMassChange}
              min={10}
              max={100}
              step={0.1}
              unit="kg"
              label={isGerman ? 'Muskelmasse' : 'Muscle Mass'}
            />
            <ChipsInput
              presets={muscleMassPresets}
              onSelect={(value) => onMuscleMassChange(Math.max(10, Math.min(100, muscleMass + value)))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
