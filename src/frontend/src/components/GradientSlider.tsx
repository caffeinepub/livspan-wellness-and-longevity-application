import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface GradientSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  className?: string;
  gradientStops: {
    position: number; // 0-100
    color: string; // oklch color
  }[];
  showScale?: boolean;
  scaleLabels?: string[];
}

export default function GradientSlider({
  value,
  onValueChange,
  min,
  max,
  step,
  className,
  gradientStops,
  showScale = false,
  scaleLabels,
}: GradientSliderProps) {
  // Create gradient string from stops
  const gradientString = gradientStops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ');

  // Generate default scale labels if not provided
  const defaultScaleLabels = () => {
    const range = max - min;
    const numLabels = 5;
    const labels: string[] = [];
    
    for (let i = 0; i < numLabels; i++) {
      const val = min + (range * i) / (numLabels - 1);
      labels.push(val.toFixed(0));
    }
    
    return labels;
  };

  const labels = scaleLabels || defaultScaleLabels();

  return (
    <div className={cn('relative', className)}>
      <style>
        {`
          .gradient-slider-track {
            background: linear-gradient(to right, ${gradientString});
          }
          .gradient-slider-track [data-radix-collection-item] {
            background: linear-gradient(to right, ${gradientString});
          }
        `}
      </style>
      
      {/* Numerical Scale (Zahlenstrahl) */}
      {showScale && (
        <div className="mb-3 relative">
          {/* Gradient background bar */}
          <div 
            className="h-2 rounded-full relative overflow-hidden"
            style={{
              background: `linear-gradient(to right, ${gradientString})`
            }}
          >
            {/* Subtle glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          </div>
          
          {/* Scale markers and labels */}
          <div className="relative mt-2 flex justify-between items-start">
            {labels.map((label, index) => {
              const position = (index / (labels.length - 1)) * 100;
              
              return (
                <div 
                  key={index}
                  className="flex flex-col items-center"
                  style={{ 
                    position: 'absolute',
                    left: `${position}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* Tick mark */}
                  <div className="w-px h-2 bg-foreground/30 mb-1" />
                  
                  {/* Label */}
                  <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Slider control */}
      <Slider
        value={[value]}
        onValueChange={(values) => onValueChange(values[0])}
        min={min}
        max={max}
        step={step}
        className={cn('gradient-slider-track', className)}
      />
    </div>
  );
}
