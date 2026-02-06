import { TrendingUp, TrendingDown, Minus, User } from 'lucide-react';

interface FutureProjectionSectionProps {
  biologicalAge: number;
  biologicalAgeTrend: 'up' | 'down' | 'flat';
  bodyForm: number;
  bodyFormTrend: 'up' | 'down' | 'flat';
  energyFocus: number;
  energyFocusTrend: 'up' | 'down' | 'flat';
  isGerman: boolean;
}

export default function FutureProjectionSection({
  biologicalAge,
  biologicalAgeTrend,
  bodyForm,
  bodyFormTrend,
  energyFocus,
  energyFocusTrend,
  isGerman,
}: FutureProjectionSectionProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return <TrendingUp className="h-6 w-6 text-jade-bright" />;
    if (trend === 'down') return <TrendingDown className="h-6 w-6 text-destructive" />;
    return <Minus className="h-6 w-6 text-muted-foreground" />;
  };

  const panels = [
    {
      title: isGerman ? 'Biologische Jugend' : 'Biological Youth',
      value: biologicalAge,
      unit: isGerman ? 'Jahre' : 'years',
      trend: biologicalAgeTrend,
      description: isGerman ? 'Geschätztes biologisches Alter' : 'Estimated biological age',
    },
    {
      title: isGerman ? 'Körperform' : 'Body Form',
      value: bodyForm,
      unit: '%',
      trend: bodyFormTrend,
      description: isGerman ? 'Optimale Körperzusammensetzung' : 'Optimal body composition',
    },
    {
      title: isGerman ? 'Energie & Fokus' : 'Energy & Focus',
      value: energyFocus,
      unit: '%',
      trend: energyFocusTrend,
      description: isGerman ? 'Mentale und körperliche Leistung' : 'Mental and physical performance',
    },
  ];

  return (
    <div className="mb-8 space-y-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold luxury-text-gold mb-2">
          Future Projection
        </h2>
        <p className="text-muted-foreground">
          {isGerman 
            ? 'Wie Ihre heutige Routine Ihre Zukunft beeinflusst' 
            : 'How your daily routine shapes your future'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {panels.map((panel, index) => (
          <div 
            key={index}
            className="future-panel rounded-xl p-6 flex flex-col items-center gap-4 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative w-24 h-24 mb-2">
              <img 
                src="/assets/generated/future-silhouette-outline.dim_512x512.png"
                alt="Future projection"
                className="w-full h-full object-contain opacity-60"
                style={{ filter: 'drop-shadow(0 0 10px oklch(var(--luxury-gold) / 0.3))' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="h-12 w-12 text-luxury-gold opacity-40" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {panel.title}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-luxury-gold-bright">
                  {panel.value}
                </span>
                <span className="text-xl text-muted-foreground">
                  {panel.unit}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                {getTrendIcon(panel.trend)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {panel.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
