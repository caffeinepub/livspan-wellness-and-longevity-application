import { DayRoutines, AutophagyScore, Gender } from '../backend';

export interface CoachingStep {
  id: string;
  priority: number;
  category: 'fasting' | 'training' | 'sleep' | 'stress' | 'nutrition' | 'body' | 'general';
  title: string;
  description: string;
  actionable: string;
  icon: string;
}

interface CoachingInput {
  routines: {
    fastingHours: number;
    trainingSessions: number;
    sleepDuration: number;
    sleepQuality: number;
    systolic: number;
    diastolic: number;
    pulse: number;
    proteinIntake: number;
    proteinTarget: number;
    veggieIntake: number;
    waterIntake: number;
    bodyFat: number;
    muscleMass: number;
  };
  scores: {
    autophagy: number;
    longevity: number;
  };
}

export function generateDailyCoaching(input: CoachingInput): CoachingStep[] {
  const steps: CoachingStep[] = [];
  const { routines, scores } = input;

  // Priority 1: Critical health metrics
  if (routines.sleepDuration < 6) {
    steps.push({
      id: 'sleep-critical',
      priority: 1,
      category: 'sleep',
      title: 'Critical: Sleep Deficit',
      description: `You slept only ${routines.sleepDuration} hours. This significantly impacts recovery and autophagy.`,
      actionable: 'Aim for 7-9 hours tonight. Consider an earlier bedtime and reduce screen time before sleep.',
      icon: '🚨'
    });
  }

  if (routines.waterIntake < 1.0) {
    steps.push({
      id: 'hydration-critical',
      priority: 1,
      category: 'nutrition',
      title: 'Critical: Severe Dehydration',
      description: `You've consumed only ${routines.waterIntake.toFixed(1)}L of water today.`,
      actionable: 'Drink at least 2L of water throughout the day. Start with a large glass now.',
      icon: '💧'
    });
  }

  // Priority 2: Autophagy optimization
  if (routines.fastingHours < 16 && scores.autophagy < 70) {
    steps.push({
      id: 'fasting-optimize',
      priority: 2,
      category: 'fasting',
      title: 'Extend Your Fasting Window',
      description: `Current fasting: ${routines.fastingHours}h. Autophagy activation peaks at 16-20 hours.`,
      actionable: 'Try to extend your fast to at least 16 hours. Consider skipping breakfast or having an early dinner.',
      icon: '⏱️'
    });
  }

  if (routines.trainingSessions === 0) {
    steps.push({
      id: 'training-needed',
      priority: 2,
      category: 'training',
      title: 'Add Movement Today',
      description: 'No training sessions logged yet. Exercise boosts autophagy and longevity.',
      actionable: 'Schedule at least 30 minutes of moderate exercise. Even a brisk walk counts!',
      icon: '🏃'
    });
  }

  // Priority 3: Nutrition quality
  if (routines.proteinIntake < routines.proteinTarget * 0.7) {
    steps.push({
      id: 'protein-boost',
      priority: 3,
      category: 'nutrition',
      title: 'Increase Protein Intake',
      description: `Current: ${routines.proteinIntake}g / Target: ${routines.proteinTarget}g. Protein supports muscle maintenance.`,
      actionable: 'Add a protein-rich meal or snack. Consider lean meat, fish, eggs, or plant-based alternatives.',
      icon: '🥩'
    });
  }

  if (routines.veggieIntake < 300) {
    steps.push({
      id: 'veggies-boost',
      priority: 3,
      category: 'nutrition',
      title: 'Boost Vegetable Intake',
      description: `Current: ${routines.veggieIntake}g / Target: 400g. Vegetables provide essential micronutrients.`,
      actionable: 'Add a large salad or vegetable side dish to your next meal.',
      icon: '🥗'
    });
  }

  // Priority 4: Stress management
  if (routines.systolic > 130 || routines.diastolic > 85 || routines.pulse > 80) {
    steps.push({
      id: 'stress-management',
      priority: 4,
      category: 'stress',
      title: 'Manage Stress Levels',
      description: 'Your cardiovascular metrics indicate elevated stress.',
      actionable: 'Practice deep breathing, meditation, or a short walk. Aim for 10 minutes of relaxation.',
      icon: '🧘'
    });
  }

  // Priority 5: Body composition
  if (routines.bodyFat > 25 || routines.muscleMass < 25) {
    steps.push({
      id: 'body-composition',
      priority: 5,
      category: 'body',
      title: 'Optimize Body Composition',
      description: 'Your body composition metrics can be improved for better longevity.',
      actionable: 'Focus on resistance training 2-3x per week and maintain a slight caloric deficit if needed.',
      icon: '💪'
    });
  }

  // Priority 6: Sleep quality
  if (routines.sleepDuration >= 6 && routines.sleepQuality < 6) {
    steps.push({
      id: 'sleep-quality',
      priority: 6,
      category: 'sleep',
      title: 'Improve Sleep Quality',
      description: `Sleep duration is adequate (${routines.sleepDuration}h) but quality is low (${routines.sleepQuality}/10).`,
      actionable: 'Create a dark, cool sleeping environment. Avoid caffeine after 2 PM and screens before bed.',
      icon: '😴'
    });
  }

  // Priority 7: Positive reinforcement
  if (scores.autophagy >= 80) {
    steps.push({
      id: 'autophagy-excellent',
      priority: 7,
      category: 'general',
      title: 'Excellent Autophagy Score!',
      description: `Your autophagy score of ${scores.autophagy} is outstanding. Keep up the great work!`,
      actionable: 'Maintain your current routine. You\'re optimizing cellular renewal effectively.',
      icon: '🌟'
    });
  }

  if (scores.longevity >= 80) {
    steps.push({
      id: 'longevity-excellent',
      priority: 7,
      category: 'general',
      title: 'Outstanding Longevity Score!',
      description: `Your longevity score of ${scores.longevity} shows excellent health optimization.`,
      actionable: 'You\'re on the right track for long-term health. Stay consistent!',
      icon: '🎯'
    });
  }

  // Priority 8: General wellness
  if (steps.length === 0) {
    steps.push({
      id: 'general-wellness',
      priority: 8,
      category: 'general',
      title: 'Maintain Your Routine',
      description: 'Your health metrics are balanced. Focus on consistency.',
      actionable: 'Continue your current routine and track your progress daily for optimal results.',
      icon: '✨'
    });
  }

  // Sort by priority and return top 5
  return steps.sort((a, b) => a.priority - b.priority).slice(0, 5);
}
