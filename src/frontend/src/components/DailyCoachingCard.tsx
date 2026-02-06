import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { CoachingStep } from '../utils/dailyCoaching';
import { CoachingInsight } from '../utils/dailyCoachingInsights';

interface DailyCoachingCardProps {
  steps: CoachingStep[];
  insights: CoachingInsight[];
  isGerman: boolean;
}

export default function DailyCoachingCard({ steps, insights, isGerman }: DailyCoachingCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fasting': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'training': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'sleep': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'stress': return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      case 'nutrition': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'body': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default: return 'bg-luxury-gold/10 text-luxury-gold-bright border-luxury-gold/30';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'praise': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'trend': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Sparkles className="h-4 w-4 text-luxury-gold" />;
    }
  };

  return (
    <Card className="glass-panel glass-panel-hover shadow-glow-gold animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg luxury-gradient-gold">
            <Sparkles className="h-6 w-6 luxury-text-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold luxury-text-gold">
              {isGerman ? 'Tägliches Coaching' : 'Daily Coaching'}
            </h3>
            <p className="text-sm text-muted-foreground font-normal">
              {isGerman ? 'Ihr personalisierter Gesundheitsplan für heute' : 'Your personalized health plan for today'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coaching Steps */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-luxury-gold-bright flex items-center gap-2">
            <span className="w-1 h-4 bg-luxury-gold rounded-full"></span>
            {isGerman ? 'Prioritäten für heute' : 'Today\'s Priorities'}
          </h4>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="p-4 rounded-lg border border-luxury-gold/20 bg-luxury-gold/5 hover:bg-luxury-gold/10 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full luxury-gradient-gold flex items-center justify-center text-lg">
                    {step.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-semibold text-foreground">{step.title}</h5>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(step.category)}`}>
                        {step.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    <div className="pt-2 border-t border-luxury-gold/10">
                      <p className="text-sm font-medium text-luxury-gold-bright">
                        💡 {step.actionable}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Insights */}
        {insights.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-luxury-gold/20">
            <h4 className="text-sm font-semibold text-luxury-gold-bright flex items-center gap-2">
              <span className="w-1 h-4 bg-luxury-gold rounded-full"></span>
              {isGerman ? 'Aktuelle Einblicke' : 'Current Insights'}
            </h4>
            <div className="space-y-2">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-relaxed">
                      {insight.icon} {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
