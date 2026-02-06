export interface CoachingInsight {
  id: string;
  type: 'warning' | 'tip' | 'praise' | 'trend';
  message: string;
  icon: string;
}

interface InsightInput {
  current: {
    fastingHours: number;
    sleepDuration: number;
    sleepQuality: number;
    waterIntake: number;
    proteinIntake: number;
    proteinTarget: number;
    systolic: number;
    pulse: number;
  };
  trends?: {
    autophagyTrend: number[];
    longevityTrend: number[];
  };
}

export function generateCoachingInsights(input: InsightInput): CoachingInsight[] {
  const insights: CoachingInsight[] = [];
  const { current, trends } = input;

  // Current state insights
  if (current.fastingHours >= 18) {
    insights.push({
      id: 'fasting-optimal',
      type: 'praise',
      message: `Excellent! ${current.fastingHours}h fasting is optimal for deep autophagy activation.`,
      icon: '🔥'
    });
  } else if (current.fastingHours < 12) {
    insights.push({
      id: 'fasting-low',
      type: 'warning',
      message: `Fasting window is short (${current.fastingHours}h). Aim for 16+ hours for autophagy benefits.`,
      icon: '⚠️'
    });
  }

  if (current.sleepDuration < 7) {
    insights.push({
      id: 'sleep-deficit',
      type: 'warning',
      message: `Sleep deficit detected (${current.sleepDuration}h). Recovery and cellular repair are compromised.`,
      icon: '😴'
    });
  }

  if (current.waterIntake < 1.5) {
    insights.push({
      id: 'hydration-low',
      type: 'tip',
      message: `Hydration is below optimal (${current.waterIntake.toFixed(1)}L). Drink more water for better cellular function.`,
      icon: '💧'
    });
  }

  if (current.proteinIntake < current.proteinTarget * 0.8) {
    insights.push({
      id: 'protein-low',
      type: 'tip',
      message: `Protein intake is ${Math.round((current.proteinIntake / current.proteinTarget) * 100)}% of target. Increase for muscle maintenance.`,
      icon: '🥩'
    });
  }

  if (current.systolic > 130 || current.pulse > 85) {
    insights.push({
      id: 'stress-elevated',
      type: 'warning',
      message: 'Cardiovascular metrics suggest elevated stress. Consider relaxation techniques.',
      icon: '🧘'
    });
  }

  // Trend-based insights
  if (trends?.autophagyTrend && trends.autophagyTrend.length >= 3) {
    const recent = trends.autophagyTrend.slice(-3);
    const isImproving = recent[2] > recent[0] + 5;
    const isDeclining = recent[2] < recent[0] - 5;

    if (isImproving) {
      insights.push({
        id: 'autophagy-improving',
        type: 'praise',
        message: 'Your autophagy score is trending upward! Keep up the excellent work.',
        icon: '📈'
      });
    } else if (isDeclining) {
      insights.push({
        id: 'autophagy-declining',
        type: 'trend',
        message: 'Autophagy score is declining. Review your fasting and training routine.',
        icon: '📉'
      });
    }
  }

  if (trends?.longevityTrend && trends.longevityTrend.length >= 3) {
    const recent = trends.longevityTrend.slice(-3);
    const isImproving = recent[2] > recent[0] + 5;

    if (isImproving) {
      insights.push({
        id: 'longevity-improving',
        type: 'praise',
        message: 'Longevity score is improving! Your health optimization is working.',
        icon: '🎯'
      });
    }
  }

  // Return top 3 most relevant insights
  return insights.slice(0, 3);
}
