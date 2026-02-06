import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StepperInput from './StepperInput';
import ChipsInput from './ChipsInput';

interface NutritionCardProps {
  isGerman: boolean;
  proteinTarget: number;
  proteinIntake: number;
  veggieIntake: number;
  waterIntake: number;
  onProteinChange: (value: number) => void;
  onVeggieChange: (value: number) => void;
  onWaterChange: (value: number) => void;
}

export default function NutritionCard({
  isGerman,
  proteinTarget,
  proteinIntake,
  veggieIntake,
  waterIntake,
  onProteinChange,
  onVeggieChange,
  onWaterChange,
}: NutritionCardProps) {
  const maxProtein = Math.max(proteinTarget * 1.5, 200);
  const maxVeggies = 800;
  const maxWater = 5;

  const proteinPresets = [
    { label: '+10g', value: 10 },
    { label: '+25g', value: 25 },
    { label: '+50g', value: 50 },
  ];

  const veggiePresets = [
    { label: '+50g', value: 50 },
    { label: '+100g', value: 100 },
    { label: '+200g', value: 200 },
  ];

  const waterPresets = [
    { label: '+0.25L', value: 0.25 },
    { label: '+0.5L', value: 0.5 },
    { label: '+1L', value: 1 },
  ];

  return (
    <Card className="glass-panel shadow-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <img src="/assets/generated/supplement-icon-transparent.dim_64x64.png" alt="Nutrition" className="h-8 w-8 drop-shadow-md" />
          <CardTitle className="text-lg">{isGerman ? 'Ernährung' : 'Nutrition'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Protein */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Protein ({isGerman ? 'Ziel' : 'Target'}: {proteinTarget}g)
              </span>
            </div>
            <StepperInput
              value={proteinIntake}
              onChange={onProteinChange}
              min={0}
              max={maxProtein}
              step={5}
              unit="g"
            />
            <ChipsInput
              presets={proteinPresets}
              onSelect={(value) => onProteinChange(Math.min(maxProtein, proteinIntake + value))}
            />
          </div>

          {/* Vegetables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {isGerman ? 'Gemüse' : 'Vegetables'} ({isGerman ? 'Ziel' : 'Target'}: 400g)
              </span>
            </div>
            <StepperInput
              value={veggieIntake}
              onChange={onVeggieChange}
              min={0}
              max={maxVeggies}
              step={10}
              unit="g"
            />
            <ChipsInput
              presets={veggiePresets}
              onSelect={(value) => onVeggieChange(Math.min(maxVeggies, veggieIntake + value))}
            />
          </div>

          {/* Water */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {isGerman ? 'Wasser' : 'Water'} ({isGerman ? 'Ziel' : 'Target'}: 2L)
              </span>
            </div>
            <StepperInput
              value={waterIntake}
              onChange={onWaterChange}
              min={0}
              max={maxWater}
              step={0.1}
              unit="L"
            />
            <ChipsInput
              presets={waterPresets}
              onSelect={(value) => onWaterChange(Math.min(maxWater, waterIntake + value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
