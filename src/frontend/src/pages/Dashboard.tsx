import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ScoreRing from '../components/ScoreRing';
import SmartInsightsOverlay from '../components/SmartInsightsOverlay';
import FastingTimer from '../components/FastingTimer';
import TrainingCard from '../components/TrainingCard';
import NutritionCard from '../components/NutritionCard';
import SleepCard from '../components/SleepCard';
import StressCard from '../components/StressCard';
import BodyCompositionCard from '../components/BodyCompositionCard';
import SupplementCard from '../components/SupplementCard';
import SmartInsight from '../components/SmartInsight';
import AutophagyScoreInfo from '../components/AutophagyScoreInfo';
import DailyCoachingCard from '../components/DailyCoachingCard';
import EnergyCapsule from '../components/EnergyCapsule';
import FutureProjectionSection from '../components/FutureProjectionSection';
import { 
  useCompleteRoutines, 
  useGetCallerUserProfile, 
  useGetBodyComposition, 
  useSaveBodyComposition,
  useGetSupplements,
  useAddSupplement,
  useUpdateSupplement,
  useDeleteSupplement,
  useGetAllDailyRoutines,
  useGetTrainings,
  useSaveTraining,
  useClearTrainings,
} from '../hooks/useQueries';
import { toast } from 'sonner';
import { DayRoutines, Training, ColorIndicator, Variant_de_en, Gender, BMIIndicatorCategory, TrainingIntensity } from '../backend';
import { AlertCircle, Info } from 'lucide-react';
import { generateDailyCoaching } from '../utils/dailyCoaching';
import { generateCoachingInsights } from '../utils/dailyCoachingInsights';

export default function Dashboard() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: bodyComposition, isLoading: bodyCompositionLoading } = useGetBodyComposition();
  const { data: supplements = [] } = useGetSupplements();
  const { data: allRoutinesData } = useGetAllDailyRoutines();
  const { data: savedTrainings = [], isLoading: trainingsLoading } = useGetTrainings();
  const completeRoutinesMutation = useCompleteRoutines();
  const saveBodyCompositionMutation = useSaveBodyComposition();
  const addSupplementMutation = useAddSupplement();
  const updateSupplementMutation = useUpdateSupplement();
  const deleteSupplementMutation = useDeleteSupplement();
  const saveTrainingMutation = useSaveTraining();
  const clearTrainingsMutation = useClearTrainings();

  const isGerman = userProfile?.preferences.language === Variant_de_en.de;

  const [showRoutineSavedModal, setShowRoutineSavedModal] = useState(false);
  const [showAutophagyInfo, setShowAutophagyInfo] = useState(false);

  const [supplementCompletions, setSupplementCompletions] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('supplementCompletions');
    return saved ? JSON.parse(saved) : {};
  });

  const [weight, setWeight] = useState(() => {
    const saved = localStorage.getItem('weight');
    return saved ? Number(saved) : 70;
  });
  const [bodyFat, setBodyFat] = useState(() => {
    const saved = localStorage.getItem('bodyFat');
    return saved ? Number(saved) : 20;
  });
  const [muscleMass, setMuscleMass] = useState(() => {
    const saved = localStorage.getItem('muscleMass');
    return saved ? Number(saved) : 30;
  });
  const [bodyCompositionInitialized, setBodyCompositionInitialized] = useState(false);

  useEffect(() => {
    if (bodyComposition && !bodyCompositionInitialized) {
      const savedWeight = localStorage.getItem('weight');
      const savedBodyFat = localStorage.getItem('bodyFat');
      const savedMuscleMass = localStorage.getItem('muscleMass');
      
      if (!savedWeight) {
        setWeight(bodyComposition.currentWeight);
        localStorage.setItem('weight', bodyComposition.currentWeight.toString());
      }
      if (!savedBodyFat) {
        setBodyFat(bodyComposition.currentBodyFatPercentage);
        localStorage.setItem('bodyFat', bodyComposition.currentBodyFatPercentage.toString());
      }
      if (!savedMuscleMass) {
        setMuscleMass(bodyComposition.currentMuscleMass);
        localStorage.setItem('muscleMass', bodyComposition.currentMuscleMass.toString());
      }
      setBodyCompositionInitialized(true);
    } else if (!bodyComposition && !bodyCompositionLoading && !bodyCompositionInitialized) {
      setBodyCompositionInitialized(true);
    }
  }, [bodyComposition, bodyCompositionLoading, bodyCompositionInitialized]);

  const [fastingHours, setFastingHours] = useState(() => {
    const saved = localStorage.getItem('fastingHours');
    return saved ? Number(saved) : 0;
  });

  const [trainingSessions, setTrainingSessions] = useState<Training[]>(() => {
    const saved = localStorage.getItem('trainingSessions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (savedTrainings.length > 0 && trainingSessions.length === 0) {
      setTrainingSessions(savedTrainings);
      localStorage.setItem('trainingSessions', JSON.stringify(savedTrainings));
    }
  }, [savedTrainings]);

  const [proteinIntake, setProteinIntake] = useState(() => {
    const saved = localStorage.getItem('proteinIntake');
    return saved ? Number(saved) : 0;
  });
  const [veggieIntake, setVeggieIntake] = useState(() => {
    const saved = localStorage.getItem('veggieIntake');
    return saved ? Number(saved) : 0;
  });
  const [waterIntake, setWaterIntake] = useState(() => {
    const saved = localStorage.getItem('waterIntake');
    return saved ? Number(saved) : 0;
  });

  const [sleepDuration, setSleepDuration] = useState(() => {
    const saved = localStorage.getItem('sleepDuration');
    return saved ? Number(saved) : 0;
  });
  const [sleepQuality, setSleepQuality] = useState(() => {
    const saved = localStorage.getItem('sleepQuality');
    return saved ? Number(saved) : 0;
  });

  const [systolic, setSystolic] = useState(() => {
    const saved = localStorage.getItem('systolic');
    return saved ? Number(saved) : 120;
  });
  const [diastolic, setDiastolic] = useState(() => {
    const saved = localStorage.getItem('diastolic');
    return saved ? Number(saved) : 80;
  });
  const [pulse, setPulse] = useState(() => {
    const saved = localStorage.getItem('pulse');
    return saved ? Number(saved) : 70;
  });

  const calculateBMI = (): number | null => {
    if (!userProfile?.bodyHeightCm || weight <= 0) return null;
    const heightMeters = Number(userProfile.bodyHeightCm) / 100;
    return weight / (heightMeters * heightMeters);
  };

  const determineBMICategory = (bmi: number | null): BMIIndicatorCategory | null => {
    if (bmi === null) return null;
    
    if (bmi >= 18.5 && bmi <= 24.9) {
      return BMIIndicatorCategory.optimal;
    } else if (bmi >= 25.0 && bmi <= 29.9) {
      return BMIIndicatorCategory.slightlyHigh;
    } else if (bmi >= 17.0 && bmi < 18.5) {
      return BMIIndicatorCategory.slightlyLow;
    } else if (bmi < 17.0) {
      return BMIIndicatorCategory.tooLow;
    } else {
      return BMIIndicatorCategory.tooHigh;
    }
  };

  const currentBMI = calculateBMI();
  const currentBMICategory = determineBMICategory(currentBMI);

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    localStorage.setItem('weight', newWeight.toString());
  };

  const handleBodyFatChange = (newBodyFat: number) => {
    setBodyFat(newBodyFat);
    localStorage.setItem('bodyFat', newBodyFat.toString());
  };

  const handleMuscleMassChange = (newMuscleMass: number) => {
    setMuscleMass(newMuscleMass);
    localStorage.setItem('muscleMass', newMuscleMass.toString());
  };

  useEffect(() => {
    localStorage.setItem('supplementCompletions', JSON.stringify(supplementCompletions));
  }, [supplementCompletions]);

  useEffect(() => {
    localStorage.setItem('fastingHours', fastingHours.toString());
  }, [fastingHours]);

  useEffect(() => {
    localStorage.setItem('trainingSessions', JSON.stringify(trainingSessions));
  }, [trainingSessions]);

  useEffect(() => {
    localStorage.setItem('proteinIntake', proteinIntake.toString());
  }, [proteinIntake]);

  useEffect(() => {
    localStorage.setItem('veggieIntake', veggieIntake.toString());
  }, [veggieIntake]);

  useEffect(() => {
    localStorage.setItem('waterIntake', waterIntake.toString());
  }, [waterIntake]);

  useEffect(() => {
    localStorage.setItem('sleepDuration', sleepDuration.toString());
  }, [sleepDuration]);

  useEffect(() => {
    localStorage.setItem('sleepQuality', sleepQuality.toString());
  }, [sleepQuality]);

  useEffect(() => {
    localStorage.setItem('systolic', systolic.toString());
  }, [systolic]);

  useEffect(() => {
    localStorage.setItem('diastolic', diastolic.toString());
  }, [diastolic]);

  useEffect(() => {
    localStorage.setItem('pulse', pulse.toString());
  }, [pulse]);

  const calculateProteinTarget = () => {
    if (!userProfile) return 100;
    
    const bodyWeight = weight;
    const gender = userProfile.gender;
    
    if (gender === Gender.male) {
      return Math.round(bodyWeight * 1.6);
    } else if (gender === Gender.female) {
      return Math.round(bodyWeight * 1.4);
    }
    return Math.round(bodyWeight * 1.5);
  };

  const getStressColorIndicator = (): ColorIndicator => {
    const isSystolicNormal = systolic >= 90 && systolic <= 120;
    const isDiastolicNormal = diastolic >= 60 && diastolic <= 80;
    const isPulseNormal = pulse >= 60 && pulse <= 80;

    if (isSystolicNormal && isDiastolicNormal && isPulseNormal) {
      return ColorIndicator.green;
    }

    const isSystolicMild = (systolic >= 80 && systolic < 90) || (systolic > 120 && systolic <= 140);
    const isDiastolicMild = (diastolic >= 50 && diastolic < 60) || (diastolic > 80 && diastolic <= 90);
    const isPulseMild = (pulse >= 50 && pulse < 60) || (pulse > 80 && pulse <= 100);

    if (isSystolicMild || isDiastolicMild || isPulseMild) {
      return ColorIndicator.yellow;
    }

    return ColorIndicator.red;
  };

  const calculateAutophagyScore = () => {
    const getFastingScore = (hours: number): number => {
      if (hours < 12) return 0;
      if (hours < 14) return 10;
      if (hours < 16) return 25;
      if (hours < 20) return 35;
      return 40;
    };

    const getTrainingScore = (sessions: Training[]): number => {
      let totalScore = 0;
      for (const session of sessions) {
        const intensityValue = 
          session.intensity === TrainingIntensity.low ? 1 :
          session.intensity === TrainingIntensity.medium ? 2 : 3;
        const sessionScore = (Number(session.durationMins) * intensityValue) / 10;
        totalScore += sessionScore;
      }
      return Math.min(30, totalScore);
    };

    const getSleepScore = (duration: number, quality: number): number => {
      const durPoints = duration < 5 ? 0 : duration < 7 ? 5 : 10;
      const qualityPoints = quality <= 5 ? (quality * 10) / 5 : 10;
      return Math.min(20, durPoints + qualityPoints);
    };

    const getStressScore = (pulseRate: number, sys: number, dia: number): number => {
      const rhrPoints = pulseRate < 60 ? 5 : pulseRate < 75 ? 3 : 0;
      const bpPoints = (sys < 120 && dia < 80) ? 5 : (sys > 130 || dia > 85) ? 0 : 3;
      return Math.min(10, rhrPoints + bpPoints);
    };

    const fastingScore = getFastingScore(fastingHours);
    const trainingScore = getTrainingScore(trainingSessions);
    const sleepScore = getSleepScore(sleepDuration, sleepQuality);
    const stressScore = getStressScore(pulse, systolic, diastolic);

    const totalScore = Math.min(100, fastingScore + trainingScore + sleepScore + stressScore);

    return {
      totalScore,
      fastingScore,
      trainingScore,
      sleepScore,
      stressScore,
    };
  };

  const calculateLongevityScore = () => {
    if (!userProfile) return 0;

    const autophagyScore = calculateAutophagyScore().totalScore;
    const proteinTarget = calculateProteinTarget();

    const calculateBodyCompositionScore = (): number => {
      const idealBodyFat = 
        userProfile.gender === Gender.male ? 14.0 :
        userProfile.gender === Gender.female ? 21.5 : 17.75;

      let bodyFatScore = 0;
      if (bodyFat >= 10.0 && bodyFat <= 25.0) {
        bodyFatScore = 50.0;
      } else {
        const diff = Math.abs(bodyFat - idealBodyFat);
        const score = 50.0 - (diff * 2.0);
        bodyFatScore = Math.max(0, score);
      }

      let muscleMassScore = 0;
      if (muscleMass >= 10.0 && muscleMass <= 100.0) {
        const normalized = (muscleMass - 10.0) / 90.0;
        muscleMassScore = 50.0 * normalized;
      }

      const combinedScore = (bodyFatScore + muscleMassScore) / 2.0;
      return Math.round(combinedScore);
    };

    const calculateNutritionScore = (): number => {
      const proteinScore = proteinIntake >= proteinTarget ? 10 : Math.round((proteinIntake * 10) / proteinTarget);
      const veggieScore = veggieIntake >= 400 ? 10 : Math.round((veggieIntake * 10) / 400);
      const waterScore = waterIntake >= 2 ? 10 : Math.round((waterIntake * 10) / 2);
      
      const totalScore = proteinScore + veggieScore + waterScore;
      return Math.min(30, totalScore);
    };

    const autophagyCouplingScore = Math.round((autophagyScore * 20) / 100);

    const bodyCompScore = calculateBodyCompositionScore();
    const nutritionScore = calculateNutritionScore();

    const totalScore = Math.min(100, bodyCompScore + nutritionScore + autophagyCouplingScore);

    return totalScore;
  };

  const autophagyScoreData = calculateAutophagyScore();
  const longevityScore = calculateLongevityScore();

  const getScoreTrendData = (scoreType: 'autophagy' | 'longevity'): number[] => {
    if (!allRoutinesData?.routines) return [];
    
    const sortedRoutines = [...allRoutinesData.routines]
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .slice(-7);
    
    return sortedRoutines.map(([_, dayData]) => {
      if (scoreType === 'autophagy') {
        return Number(dayData.autophagyScore.totalScore);
      } else {
        return Number(dayData.longevityScore.totalScore);
      }
    });
  };

  const autophagyTrendData = getScoreTrendData('autophagy');
  const longevityTrendData = getScoreTrendData('longevity');

  const coachingSteps = generateDailyCoaching({
    routines: {
      fastingHours,
      trainingSessions: trainingSessions.length,
      sleepDuration,
      sleepQuality,
      systolic,
      diastolic,
      pulse,
      proteinIntake,
      proteinTarget: calculateProteinTarget(),
      veggieIntake,
      waterIntake,
      bodyFat,
      muscleMass,
    },
    scores: {
      autophagy: autophagyScoreData.totalScore,
      longevity: longevityScore,
    },
  });

  const coachingInsights = generateCoachingInsights({
    current: {
      fastingHours,
      sleepDuration,
      sleepQuality,
      waterIntake,
      proteinIntake,
      proteinTarget: calculateProteinTarget(),
      systolic,
      pulse,
    },
    trends: {
      autophagyTrend: autophagyTrendData,
      longevityTrend: longevityTrendData,
    },
  });

  // Calculate completion for each routine section
  const fastingCompletion = Math.min(1, fastingHours / 16);
  const trainingCompletion = Math.min(1, trainingSessions.length / 2);
  const sleepCompletion = Math.min(1, (sleepDuration / 8 + sleepQuality / 10) / 2);
  const stressCompletion = getStressColorIndicator() === ColorIndicator.green ? 1 : 
                           getStressColorIndicator() === ColorIndicator.yellow ? 0.6 : 0.3;
  const nutritionCompletion = Math.min(1, (proteinIntake / calculateProteinTarget() + veggieIntake / 400 + waterIntake / 2) / 3);
  const bodyCompCompletion = Math.min(1, (bodyFat > 0 ? 0.5 : 0) + (muscleMass > 0 ? 0.5 : 0));
  const supplementCompletion = supplements.length > 0 ? 
    Object.values(supplementCompletions).filter(Boolean).length / supplements.length : 0;

  // Calculate Future Projection values
  const calculateBiologicalAge = (): number => {
    if (!userProfile) return 30;
    const currentYear = new Date().getFullYear();
    const chronologicalAge = currentYear - Number(userProfile.birthYear);
    const healthScore = (autophagyScoreData.totalScore + longevityScore) / 2;
    const ageDelta = (50 - healthScore) * 0.2;
    return Math.max(18, Math.round(chronologicalAge + ageDelta));
  };

  const calculateBodyForm = (): number => {
    return Math.round((bodyCompCompletion * 100));
  };

  const calculateEnergyFocus = (): number => {
    return Math.round(((sleepCompletion + nutritionCompletion + (1 - stressCompletion)) / 3) * 100);
  };

  const getTrend = (current: number, history: number[]): 'up' | 'down' | 'flat' => {
    if (history.length < 2) return 'flat';
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    if (current > avg + 5) return 'up';
    if (current < avg - 5) return 'down';
    return 'flat';
  };

  const biologicalAge = calculateBiologicalAge();
  const bodyForm = calculateBodyForm();
  const energyFocus = calculateEnergyFocus();

  const handleSaveRoutine = async () => {
    try {
      const routines: DayRoutines = {
        fastingSession: {
          startTimestamp: BigInt(Date.now() * 1_000_000),
          endTimestamp: BigInt((Date.now() + fastingHours * 3600000) * 1_000_000),
          durationHours: BigInt(fastingHours),
          isCompleted: true,
        },
        trainingSessions: trainingSessions,
        sleepMetrics: {
          durationHours: BigInt(sleepDuration),
          qualityRating: BigInt(sleepQuality),
        },
        stressMetrics: {
          bloodPressureSystolic: BigInt(systolic),
          bloodPressureDiastolic: BigInt(diastolic),
          pulse: BigInt(pulse),
          stressColorIndicator: getStressColorIndicator(),
        },
        nutritionMetrics: {
          proteinIntake: BigInt(proteinIntake),
          veggieIntake: BigInt(veggieIntake),
          waterIntake: BigInt(waterIntake),
          proteinTarget: BigInt(calculateProteinTarget()),
        },
        bodyComposition: {
          weight,
          bodyFatPercentage: bodyFat,
          muscleMass,
        },
      };

      await completeRoutinesMutation.mutateAsync(routines);
      setShowRoutineSavedModal(true);
      
      toast.success(
        isGerman ? 'Routine erfolgreich gespeichert!' : 'Routine saved successfully!',
        {
          description: isGerman 
            ? 'Deine tägliche Routine wurde erfolgreich gespeichert.' 
            : 'Your daily routine has been saved successfully.',
        }
      );
    } catch (error: any) {
      console.error('Error saving routine:', error);
      toast.error(
        isGerman ? 'Fehler beim Speichern' : 'Error saving routine',
        {
          description: error.message || (isGerman ? 'Ein Fehler ist aufgetreten' : 'An error occurred'),
        }
      );
    }
  };

  const handleAddSupplement = async (name: string, dosage: string, time: string, note: string | null) => {
    try {
      await addSupplementMutation.mutateAsync({ name, dosage, time, note });
      toast.success(
        isGerman ? 'Supplement hinzugefügt' : 'Supplement added',
        {
          description: isGerman ? `${name} wurde hinzugefügt` : `${name} has been added`,
        }
      );
    } catch (error: any) {
      console.error('Error adding supplement:', error);
      toast.error(
        isGerman ? 'Fehler beim Hinzufügen' : 'Error adding supplement',
        {
          description: error.message || (isGerman ? 'Ein Fehler ist aufgetreten' : 'An error occurred'),
        }
      );
    }
  };

  const handleUpdateSupplement = async (supplementId: bigint, name: string, dosage: string, time: string, note: string | null) => {
    try {
      await updateSupplementMutation.mutateAsync({ supplementId, name, dosage, time, note });
      toast.success(
        isGerman ? 'Supplement aktualisiert' : 'Supplement updated',
        {
          description: isGerman ? `${name} wurde aktualisiert` : `${name} has been updated`,
        }
      );
    } catch (error: any) {
      console.error('Error updating supplement:', error);
      toast.error(
        isGerman ? 'Fehler beim Aktualisieren' : 'Error updating supplement',
        {
          description: error.message || (isGerman ? 'Ein Fehler ist aufgetreten' : 'An error occurred'),
        }
      );
    }
  };

  const handleDeleteSupplement = async (supplementId: bigint) => {
    try {
      await deleteSupplementMutation.mutateAsync(supplementId);
      toast.success(
        isGerman ? 'Supplement gelöscht' : 'Supplement deleted',
        {
          description: isGerman ? 'Das Supplement wurde gelöscht' : 'The supplement has been deleted',
        }
      );
    } catch (error: any) {
      console.error('Error deleting supplement:', error);
      toast.error(
        isGerman ? 'Fehler beim Löschen' : 'Error deleting supplement',
        {
          description: error.message || (isGerman ? 'Ein Fehler ist aufgetreten' : 'An error occurred'),
        }
      );
    }
  };

  const handleToggleSupplement = (id: bigint) => {
    const idStr = id.toString();
    setSupplementCompletions(prev => ({
      ...prev,
      [idStr]: !prev[idStr],
    }));
  };

  const handleSaveTrainings = async () => {
    try {
      for (const training of trainingSessions) {
        await saveTrainingMutation.mutateAsync(training);
      }
      toast.success(
        isGerman ? 'Training gespeichert' : 'Training saved',
        {
          description: isGerman ? 'Deine Trainingseinheiten wurden gespeichert' : 'Your training sessions have been saved',
        }
      );
    } catch (error: any) {
      console.error('Error saving trainings:', error);
      toast.error(
        isGerman ? 'Fehler beim Speichern' : 'Error saving training',
        {
          description: error.message || (isGerman ? 'Ein Fehler ist aufgetreten' : 'An error occurred'),
        }
      );
    }
  };

  const handleClearTrainings = async () => {
    try {
      await clearTrainingsMutation.mutateAsync();
      setTrainingSessions([]);
      localStorage.setItem('trainingSessions', JSON.stringify([]));
      toast.success(
        isGerman ? 'Training gelöscht' : 'Training cleared',
        {
          description: isGerman ? 'Alle Trainingseinheiten wurden gelöscht' : 'All training sessions have been cleared',
        }
      );
    } catch (error: any) {
      console.error('Error clearing trainings:', error);
      toast.error(
        isGerman ? 'Fehler beim Löschen' : 'Error clearing training',
        {
          description: error.message || (isGerman ? 'Ein Fehler ist aufgetreten' : 'An error occurred'),
        }
      );
    }
  };

  // Map coaching insight types to SmartInsight types
  const mapInsightType = (type: string): 'fasting' | 'sleep' | 'hydration' | 'recovery' => {
    if (type === 'warning' || type === 'tip') return 'recovery';
    if (type === 'praise' || type === 'trend') return 'fasting';
    return 'fasting';
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated gold caustics overlay */}
      <div className="gold-caustics-overlay" />
      <div className="bokeh-overlay" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Future Projection Section */}
        <FutureProjectionSection
          biologicalAge={biologicalAge}
          biologicalAgeTrend={getTrend(biologicalAge, autophagyTrendData)}
          bodyForm={bodyForm}
          bodyFormTrend={getTrend(bodyForm, longevityTrendData)}
          energyFocus={energyFocus}
          energyFocusTrend={getTrend(energyFocus, autophagyTrendData)}
          isGerman={isGerman}
        />

        {/* Daily Coaching Card */}
        <DailyCoachingCard
          steps={coachingSteps}
          insights={coachingInsights}
          isGerman={isGerman}
        />

        {/* Score Rings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="cockpit-data-panel flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/assets/generated/autophagy-icon-transparent.dim_64x64.png" 
                alt="Autophagy" 
                className="h-10 w-10 drop-shadow-md" 
              />
              <h3 className="text-xl font-bold luxury-text-gold">
                {isGerman ? 'Autophagie Score' : 'Autophagy Score'}
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowAutophagyInfo(true)}
                      className="ml-2 text-muted-foreground hover:text-luxury-gold transition-colors"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isGerman ? 'Mehr Informationen' : 'More information'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <ScoreRing
              score={autophagyScoreData.totalScore}
              label={isGerman ? 'Zellerneuerung' : 'Cell Renewal'}
            />
          </div>

          <div className="cockpit-data-panel flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/assets/generated/longevity-icon-transparent.dim_64x64.png" 
                alt="Longevity" 
                className="h-10 w-10 drop-shadow-md" 
              />
              <h3 className="text-xl font-bold luxury-text-gold">
                {isGerman ? 'Langlebigkeits Score' : 'Longevity Score'}
              </h3>
            </div>
            <ScoreRing
              score={longevityScore}
              label={isGerman ? 'Gesundheitsstatus' : 'Health Status'}
            />
          </div>
        </div>

        {/* Routine Sections in Energy Capsules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnergyCapsule completion={fastingCompletion} accentMode="gold">
            <FastingTimer
              fastingHours={fastingHours}
              onFastingDurationChange={setFastingHours}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={trainingCompletion} accentMode="jade">
            <TrainingCard
              isGerman={isGerman}
              trainingSessions={trainingSessions}
              onTrainingSessionsChange={setTrainingSessions}
              onSaveTrainings={handleSaveTrainings}
              onClearTrainings={handleClearTrainings}
              isSaving={saveTrainingMutation.isPending}
              isLoading={clearTrainingsMutation.isPending}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={sleepCompletion} accentMode="jade">
            <SleepCard
              isGerman={isGerman}
              sleepDuration={sleepDuration}
              sleepQuality={sleepQuality}
              onSleepDurationChange={setSleepDuration}
              onSleepQualityChange={setSleepQuality}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={stressCompletion} accentMode="jade">
            <StressCard
              isGerman={isGerman}
              systolic={systolic}
              diastolic={diastolic}
              pulse={pulse}
              onSystolicChange={setSystolic}
              onDiastolicChange={setDiastolic}
              onPulseChange={setPulse}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={nutritionCompletion} accentMode="emerald">
            <NutritionCard
              isGerman={isGerman}
              proteinIntake={proteinIntake}
              veggieIntake={veggieIntake}
              waterIntake={waterIntake}
              proteinTarget={calculateProteinTarget()}
              onProteinChange={setProteinIntake}
              onVeggieChange={setVeggieIntake}
              onWaterChange={setWaterIntake}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={bodyCompCompletion} accentMode="jade">
            <BodyCompositionCard
              isGerman={isGerman}
              weight={weight}
              bodyFat={bodyFat}
              muscleMass={muscleMass}
              bmi={currentBMI}
              bmiCategory={currentBMICategory}
              onWeightChange={handleWeightChange}
              onBodyFatChange={handleBodyFatChange}
              onMuscleMassChange={handleMuscleMassChange}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={supplementCompletion} accentMode="emerald" className="lg:col-span-2">
            <SupplementCard
              isGerman={isGerman}
              supplements={supplements}
              supplementCompletions={supplementCompletions}
              onAddSupplement={handleAddSupplement}
              onUpdateSupplement={handleUpdateSupplement}
              onDeleteSupplement={handleDeleteSupplement}
              onToggleSupplement={handleToggleSupplement}
            />
          </EnergyCapsule>
        </div>

        {/* Smart Insights */}
        {coachingInsights.length > 0 && (
          <div className="space-y-4">
            {coachingInsights.map((insight, index) => (
              <SmartInsight
                key={index}
                type={mapInsightType(insight.type)}
                isGerman={isGerman}
                message={insight.message}
              />
            ))}
          </div>
        )}

        {/* Save Routine Button */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleSaveRoutine}
            disabled={completeRoutinesMutation.isPending}
            size="lg"
            className="px-12 py-6 text-lg font-bold bg-luxury-gold hover:bg-luxury-gold-bright text-black transition-all duration-200 hover:scale-105 shadow-glow-gold"
          >
            {completeRoutinesMutation.isPending
              ? (isGerman ? 'Speichern...' : 'Saving...')
              : (isGerman ? 'Routine Speichern' : 'Save Routine')}
          </Button>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showRoutineSavedModal} onOpenChange={setShowRoutineSavedModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="luxury-text-gold">
              {isGerman ? 'Routine Gespeichert!' : 'Routine Saved!'}
            </DialogTitle>
            <DialogDescription>
              {isGerman
                ? 'Deine tägliche Routine wurde erfolgreich gespeichert. Deine LIV Tokens wurden gutgeschrieben.'
                : 'Your daily routine has been saved successfully. Your LIV tokens have been credited.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowRoutineSavedModal(false)} className="bg-luxury-gold hover:bg-luxury-gold-bright text-black">
              {isGerman ? 'Schließen' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AutophagyScoreInfo
        isOpen={showAutophagyInfo}
        onClose={() => setShowAutophagyInfo(false)}
        isGerman={isGerman}
        scoreData={autophagyScoreData}
      />
    </div>
  );
}
