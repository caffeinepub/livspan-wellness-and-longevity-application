import { Lightbulb, Droplets, Moon, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SmartInsightProps {
  type: 'fasting' | 'sleep' | 'hydration' | 'recovery';
  isGerman: boolean;
  message: string;
}

export default function SmartInsight({ type, message }: SmartInsightProps) {
  const getIcon = () => {
    switch (type) {
      case 'fasting':
        return <Activity className="h-5 w-5 text-primary" />;
      case 'sleep':
        return <Moon className="h-5 w-5 text-primary" />;
      case 'hydration':
        return <Droplets className="h-5 w-5 text-primary" />;
      case 'recovery':
        return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="glass-panel border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Card>
  );
}
