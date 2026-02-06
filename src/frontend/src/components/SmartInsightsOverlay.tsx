import { useEffect, useState } from 'react';
import { TrendingUp, Award, AlertCircle } from 'lucide-react';

interface SmartInsightsOverlayProps {
  score: number;
  scoreType: 'autophagy' | 'longevity';
  isGerman: boolean;
}

export default function SmartInsightsOverlay({ score, scoreType, isGerman }: SmartInsightsOverlayProps) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState<'praise' | 'warning' | 'motivation'>('motivation');

  useEffect(() => {
    if (score > 85) {
      setShow(true);
      setIcon('praise');
      if (scoreType === 'autophagy') {
        setMessage(
          isGerman
            ? 'Hervorragend! Ihr Autophagie-Score ist außergewöhnlich hoch. Weiter so!'
            : 'Excellent! Your Autophagy Score is exceptionally high. Keep it up!'
        );
      } else {
        setMessage(
          isGerman
            ? 'Fantastisch! Ihr Langlebigkeits-Score zeigt optimale Gesundheit. Sie sind auf dem richtigen Weg!'
            : 'Fantastic! Your Longevity Score shows optimal health. You\'re on the right track!'
        );
      }
    } else if (score < 25) {
      setShow(true);
      setIcon('warning');
      if (scoreType === 'autophagy') {
        setMessage(
          isGerman
            ? 'Ihr Autophagie-Score braucht Aufmerksamkeit. Versuchen Sie längeres Fasten und mehr Training.'
            : 'Your Autophagy Score needs attention. Try longer fasting and more exercise.'
        );
      } else {
        setMessage(
          isGerman
            ? 'Ihr Langlebigkeits-Score kann verbessert werden. Fokussieren Sie sich auf Ernährung und Körperzusammensetzung.'
            : 'Your Longevity Score can be improved. Focus on nutrition and body composition.'
        );
      }
    } else {
      setShow(false);
    }

    if (score > 85 || score < 25) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [score, scoreType, isGerman]);

  if (!show) return null;

  const getIconComponent = () => {
    switch (icon) {
      case 'praise':
        return <Award className="h-6 w-6 text-luxury-gold-bright" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <TrendingUp className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (icon) {
      case 'praise':
        return 'border-luxury-gold/50';
      case 'warning':
        return 'border-yellow-500/30';
      default:
        return 'border-blue-500/30';
    }
  };

  return (
    <div 
      className={`glass-panel rounded-lg p-4 border-2 ${getBorderColor()} shadow-glow animate-slide-up mt-4`}
      style={{
        animation: 'slideUp 0.5s ease-out forwards'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIconComponent()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
