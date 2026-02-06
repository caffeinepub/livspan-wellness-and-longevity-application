import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  label: string;
  icon: string;
  description: string;
  trendData?: number[];
}

export default function ScoreRing({ score, label, icon, description, trendData = [] }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (scoreValue: number): string => {
    if (scoreValue < 50) {
      const ratio = scoreValue / 50;
      const l = 0.55 + (ratio * 0.10);
      const c = 0.20 - (ratio * 0.05);
      const h = 30 + (ratio * 50);
      return `oklch(${l} ${c} ${h})`;
    } else {
      const ratio = (scoreValue - 50) / 50;
      const l = 0.65 + (ratio * 0.05);
      const c = 0.15 + (ratio * 0.01);
      const h = 80 + (ratio * 75);
      return `oklch(${l} ${c} ${h})`;
    }
  };

  const scoreColor = getScoreColor(animatedScore);

  const getBackgroundGradient = (scoreValue: number): string => {
    if (scoreValue < 40) {
      return 'radial-gradient(ellipse at center, oklch(0.55 0.22 25 / 0.15) 0%, transparent 70%)';
    } else if (scoreValue < 70) {
      return 'radial-gradient(ellipse at center, oklch(0.75 0.15 85 / 0.15) 0%, transparent 70%)';
    } else {
      return 'radial-gradient(ellipse at center, oklch(var(--luxury-gold) / 0.2) 0%, transparent 70%)';
    }
  };

  const getGlowIntensity = (scoreValue: number): string => {
    if (scoreValue >= 85) {
      return 'portal-pulse';
    } else if (scoreValue < 25) {
      return 'shadow-glow-sm';
    }
    return '';
  };

  const scaleLabels = ['0', '25', '50', '75', '100'];

  const generateSparklinePath = (): string => {
    if (trendData.length < 2) return '';
    
    const width = 200;
    const height = 40;
    const padding = 5;
    const maxScore = 100;
    
    const points = trendData.map((value, index) => {
      const x = padding + (index / (trendData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((value / maxScore) * (height - 2 * padding));
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const sparklinePath = generateSparklinePath();

  return (
    <div 
      className={`glass-panel portal-ring rounded-xl p-6 flex flex-col items-center gap-4 shadow-glass relative overflow-hidden transition-all duration-700 ${getGlowIntensity(animatedScore)}`}
      style={{
        background: getBackgroundGradient(animatedScore)
      }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl" />
      
      <div className="relative w-full z-10">
        <div className="mb-4 relative">
          <div 
            className="h-2 rounded-full relative overflow-hidden"
            style={{
              background: `linear-gradient(to right, 
                oklch(0.55 0.22 25) 0%, 
                oklch(0.75 0.15 85) 50%, 
                oklch(var(--luxury-gold)) 80%, 
                oklch(var(--luxury-gold-bright)) 100%)`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          </div>
          
          <div className="relative mt-2 flex justify-between items-start">
            {scaleLabels.map((label, index) => {
              const position = (index / (scaleLabels.length - 1)) * 100;
              
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
                  <div className="w-px h-2 bg-foreground/30 mb-1" />
                  <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-8 rounded-full bg-muted/20 overflow-hidden relative">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out relative"
            style={{ 
              width: `${animatedScore}%`,
              background: `linear-gradient(to right, 
                oklch(0.55 0.22 25) 0%, 
                oklch(0.75 0.15 85) 50%, 
                oklch(var(--luxury-gold)) 80%, 
                oklch(var(--luxury-gold-bright)) 100%)`,
              backgroundSize: '200% 100%',
              backgroundPosition: `${100 - animatedScore}% 0`,
              boxShadow: animatedScore >= 85 
                ? `0 0 20px ${scoreColor}80, inset 0 1px 2px rgba(255,255,255,0.2)` 
                : `0 0 20px ${scoreColor}40, inset 0 1px 2px rgba(255,255,255,0.2)`
            }}
          >
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: `linear-gradient(90deg, transparent, ${scoreColor}80, transparent)`,
                animation: 'shimmer 2s infinite'
              }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center mt-4 gap-3">
          <img 
            src={icon} 
            alt={label} 
            className="h-10 w-10 drop-shadow-lg" 
          />
          <span 
            className="text-5xl font-bold transition-colors duration-700"
            style={{ 
              color: scoreColor,
              textShadow: animatedScore >= 85 ? `0 0 20px ${scoreColor}80` : 'none'
            }}
          >
            {Math.round(animatedScore)}%
          </span>
        </div>

        {trendData.length >= 2 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-xs text-muted-foreground font-medium">
              Trend (letzte Tage / recent days)
            </div>
            <svg 
              width="200" 
              height="40" 
              className="opacity-70"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
            >
              <line x1="5" y1="20" x2="195" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              
              <path
                d={sparklinePath}
                fill="none"
                stroke={scoreColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-700"
              />
              
              {trendData.map((value, index) => {
                const x = 5 + (index / (trendData.length - 1)) * 190;
                const y = 35 - ((value / 100) * 30);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill={scoreColor}
                    className="transition-all duration-700"
                  />
                );
              })}
            </svg>
          </div>
        )}
      </div>
      
      <div className="text-center relative z-10">
        <h3 className="text-lg font-semibold text-foreground mb-1">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
