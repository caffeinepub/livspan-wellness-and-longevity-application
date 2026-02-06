import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Dumbbell, Moon, Heart } from 'lucide-react';

interface AutophagyScoreInfoProps {
  isOpen: boolean;
  onClose: () => void;
  isGerman: boolean;
  scoreData: {
    totalScore: number;
    fastingScore: number;
    trainingScore: number;
    sleepScore: number;
    stressScore: number;
  };
}

export default function AutophagyScoreInfo({ isOpen, onClose, isGerman, scoreData }: AutophagyScoreInfoProps) {
  const components = [
    {
      icon: Clock,
      label: isGerman ? 'Fasten' : 'Fasting',
      score: scoreData.fastingScore,
      maxScore: 40,
      weight: '40%',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      ranges: isGerman ? [
        '< 12h = 0 Punkte',
        '12-14h = 10 Punkte',
        '14-16h = 25 Punkte',
        '16-20h = 35 Punkte',
        '> 20h = 40 Punkte'
      ] : [
        '< 12h = 0 points',
        '12-14h = 10 points',
        '14-16h = 25 points',
        '16-20h = 35 points',
        '> 20h = 40 points'
      ]
    },
    {
      icon: Dumbbell,
      label: isGerman ? 'Training' : 'Training',
      score: scoreData.trainingScore,
      maxScore: 30,
      weight: '30%',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      ranges: isGerman ? [
        'Formel: min(30, (Dauer × Intensität) / 10)',
        'Intensität: Niedrig=1, Mittel=2, Hoch=3',
        'Mehrere Trainingseinheiten werden addiert'
      ] : [
        'Formula: min(30, (duration × intensity) / 10)',
        'Intensity: Low=1, Medium=2, High=3',
        'Multiple sessions are summed'
      ]
    },
    {
      icon: Moon,
      label: isGerman ? 'Schlaf' : 'Sleep',
      score: scoreData.sleepScore,
      maxScore: 20,
      weight: '20%',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      ranges: isGerman ? [
        'Dauer: < 5h = 0, 5-6h = 5, 7-9h = 10 Punkte',
        'Qualität: (Bewertung/5) × 10 Punkte',
        'Gesamt: Dauer + Qualität (max 20)'
      ] : [
        'Duration: < 5h = 0, 5-6h = 5, 7-9h = 10 points',
        'Quality: (rating/5) × 10 points',
        'Total: Duration + Quality (max 20)'
      ]
    },
    {
      icon: Heart,
      label: isGerman ? 'Stress' : 'Stress',
      score: scoreData.stressScore,
      maxScore: 10,
      weight: '10%',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      ranges: isGerman ? [
        'Ruhepuls: < 60 = 5, 60-75 = 3, > 75 = 0 Punkte',
        'Blutdruck: < 120/80 = 5, > 130/85 = 0 Punkte',
        'Gesamt: Puls + Blutdruck (max 10)'
      ] : [
        'Resting HR: < 60 = 5, 60-75 = 3, > 75 = 0 points',
        'Blood Pressure: < 120/80 = 5, > 130/85 = 0 points',
        'Total: HR + BP (max 10)'
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isGerman ? 'Autophagie-Score Berechnung' : 'Autophagy Score Calculation'}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {isGerman 
              ? 'Ihr Autophagie-Score basiert auf vier Hauptfaktoren, die zur zellulären Erneuerung beitragen.' 
              : 'Your Autophagy Score is based on four key factors that contribute to cellular renewal.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Total Score Display */}
          <div className="glass-panel rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isGerman ? 'Gesamt-Score' : 'Total Score'}
            </p>
            <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
              {scoreData.totalScore}
            </div>
            <p className="text-sm text-muted-foreground">
              {isGerman ? 'von 100 Punkten' : 'out of 100 points'}
            </p>
            <Progress value={scoreData.totalScore} className="mt-4 h-3" />
          </div>

          {/* Component Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {isGerman ? 'Komponenten-Aufschlüsselung' : 'Component Breakdown'}
            </h3>
            {components.map((component, index) => {
              const Icon = component.icon;
              const percentage = (component.score / component.maxScore) * 100;
              
              return (
                <div key={index} className="glass-panel rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${component.bgColor}`}>
                        <Icon className={`h-5 w-5 ${component.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{component.label}</h4>
                        <p className="text-xs text-muted-foreground">
                          {isGerman ? 'Gewichtung: ' : 'Weight: '}{component.weight}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-base font-bold">
                      {component.score}/{component.maxScore}
                    </Badge>
                  </div>
                  
                  <Progress value={percentage} className="h-2" />
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {component.ranges.map((range, idx) => (
                      <p key={idx}>• {range}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optimal Ranges Info */}
          <div className="glass-panel rounded-lg p-4 bg-primary/5">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-primary">💡</span>
              {isGerman ? 'Optimale Bereiche' : 'Optimal Ranges'}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {isGerman ? 'Fasten: 16-20 Stunden für maximale Autophagie' : 'Fasting: 16-20 hours for maximum autophagy'}</li>
              <li>• {isGerman ? 'Training: Regelmäßige, intensive Einheiten' : 'Training: Regular, intense sessions'}</li>
              <li>• {isGerman ? 'Schlaf: 7-9 Stunden mit hoher Qualität' : 'Sleep: 7-9 hours with high quality'}</li>
              <li>• {isGerman ? 'Stress: Niedriger Ruhepuls und optimaler Blutdruck' : 'Stress: Low resting heart rate and optimal blood pressure'}</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
