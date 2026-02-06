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

      await saveBodyCompositionMutation.mutateAsync({
        weight,
        bodyFat,
        muscleMass,
      });

      setFastingHours(0);
      setTrainingSessions([]);
      setProteinIntake(0);
      setVeggieIntake(0);
      setWaterIntake(0);
      setSleepDuration(0);
      setSleepQuality(0);
      setSystolic(120);
      setDiastolic(80);
      setPulse(70);
      setSupplementCompletions({});

      localStorage.removeItem('fastingHours');
      localStorage.removeItem('trainingSessions');
      localStorage.removeItem('proteinIntake');
      localStorage.removeItem('veggieIntake');
      localStorage.removeItem('waterIntake');
      localStorage.removeItem('sleepDuration');
      localStorage.removeItem('sleepQuality');
      localStorage.removeItem('systolic');
      localStorage.removeItem('diastolic');
      localStorage.removeItem('pulse');
      localStorage.removeItem('supplementCompletions');

      toast.success(
        isGerman 
          ? 'Tägliche Routine gespeichert! 10 LIV Token verdient.' 
          : 'Daily routine saved! Earned 10 LIV tokens.'
      );
    } catch (error: any) {
      if (error.message && (
        error.message.includes('Routine already completed today') ||
        error.message.includes('already completed')
      )) {
        setShowRoutineSavedModal(true);
      } else {
        toast.error(
          isGerman 
            ? 'Fehler beim Speichern der Routine' 
            : 'Error saving routine'
        );
      }
      console.error('Error completing routines:', error);
    }
  };

  const handleSaveTrainings = async () => {
    try {
      for (const training of trainingSessions) {
        await saveTrainingMutation.mutateAsync(training);
      }
      toast.success('Training sessions saved successfully');
    } catch (error) {
      toast.error('Error saving training sessions');
      console.error('Error saving trainings:', error);
    }
  };

  const handleClearTrainings = async () => {
    try {
      await clearTrainingsMutation.mutateAsync();
      setTrainingSessions([]);
      localStorage.removeItem('trainingSessions');
      toast.success('Training sessions cleared');
    } catch (error) {
      toast.error('Error clearing training sessions');
      console.error('Error clearing trainings:', error);
    }
  };

  const handleAddSupplement = async (name: string, dosage: string, time: string, note: string | null) => {
    try {
      await addSupplementMutation.mutateAsync({ name, dosage, time, note });
      toast.success(
        isGerman 
          ? 'Supplement hinzugefügt' 
          : 'Supplement added'
      );
    } catch (error) {
      toast.error(
        isGerman 
          ? 'Fehler beim Hinzufügen des Supplements' 
          : 'Error adding supplement'
      );
      console.error('Error adding supplement:', error);
    }
  };

  const handleUpdateSupplement = async (supplementId: bigint, name: string, dosage: string, time: string, note: string | null) => {
    try {
      await updateSupplementMutation.mutateAsync({ supplementId, name, dosage, time, note });
      toast.success(
        isGerman 
          ? 'Supplement aktualisiert' 
          : 'Supplement updated'
      );
    } catch (error) {
      toast.error(
        isGerman 
          ? 'Fehler beim Aktualisieren des Supplements' 
          : 'Error updating supplement'
      );
      console.error('Error updating supplement:', error);
    }
  };

  const handleDeleteSupplement = async (supplementId: bigint) => {
    try {
      await deleteSupplementMutation.mutateAsync(supplementId);
      setSupplementCompletions(prev => {
        const newState = { ...prev };
        delete newState[supplementId.toString()];
        return newState;
      });
      toast.success(
        isGerman 
          ? 'Supplement gelöscht' 
          : 'Supplement deleted'
      );
    } catch (error) {
      toast.error(
        isGerman 
          ? 'Fehler beim Löschen des Supplements' 
          : 'Error deleting supplement'
      );
      console.error('Error deleting supplement:', error);
    }
  };

  const handleToggleSupplement = (id: bigint) => {
    const idStr = id.toString();
    setSupplementCompletions(prev => ({
      ...prev,
      [idStr]: !prev[idStr]
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 luxury-text-gold">
            {isGerman ? 'Luxury Health Coach' : 'Luxury Health Coach'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Ihr persönlicher Premium-Gesundheitscoach für optimale Langlebigkeit' 
              : 'Your personal premium health coach for optimal longevity'}
          </p>
        </div>

        <div className="mb-8">
          <DailyCoachingCard 
            steps={coachingSteps} 
            insights={coachingInsights}
            isGerman={isGerman}
          />
        </div>

        <FutureProjectionSection
          biologicalAge={biologicalAge}
          biologicalAgeTrend={getTrend(biologicalAge, [])}
          bodyForm={bodyForm}
          bodyFormTrend={getTrend(bodyForm, [])}
          energyFocus={energyFocus}
          energyFocusTrend={getTrend(energyFocus, [])}
          isGerman={isGerman}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative cockpit-data-panel">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowAutophagyInfo(true)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border border-luxury-gold/20 hover:border-luxury-gold/50"
                  >
                    <Info className="h-5 w-5 text-luxury-gold" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isGerman ? 'Autophagie-Score Details' : 'Autophagy Score Details'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ScoreRing
              score={autophagyScoreData.totalScore}
              label={isGerman ? 'Autophagie-Score' : 'Autophagy Score'}
              description={isGerman ? 'Zellerneuerung' : 'Cell Renewal'}
              icon="/assets/generated/autophagy-icon-transparent.dim_64x64.png"
              trendData={autophagyTrendData}
            />
            <SmartInsightsOverlay
              score={autophagyScoreData.totalScore}
              scoreType="autophagy"
              isGerman={isGerman}
            />
          </div>
          <div className="relative cockpit-data-panel">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border border-luxury-gold/20 hover:border-luxury-gold/50"
                  >
                    <Info className="h-5 w-5 text-luxury-gold" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isGerman ? 'Langlebigkeits-Score Details' : 'Longevity Score Details'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isGerman 
                      ? 'Körperzusammensetzung 50%, Ernährung 30%, Autophagie 20%' 
                      : 'Body Composition 50%, Nutrition 30%, Autophagy 20%'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ScoreRing
              score={longevityScore}
              label={isGerman ? 'Langlebigkeits-Score' : 'Longevity Score'}
              description={isGerman ? 'Gesundheitsstatus' : 'Health Status'}
              icon="/assets/generated/longevity-icon-transparent.dim_64x64.png"
              trendData={longevityTrendData}
            />
            <SmartInsightsOverlay
              score={longevityScore}
              scoreType="longevity"
              isGerman={isGerman}
            />
          </div>
        </div>

        <EnergyCapsule completion={bodyCompCompletion} className="mb-8 p-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <EnergyCapsule completion={fastingCompletion}>
              <div className="p-6">
                <FastingTimer
                  fastingHours={fastingHours}
                  onFastingDurationChange={setFastingHours}
                />
              </div>
            </EnergyCapsule>
            {fastingHours < 12 && (
              <SmartInsight
                type="fasting"
                isGerman={isGerman}
                message={
                  isGerman
                    ? 'Tipp: Versuchen Sie, mindestens 16 Stunden zu fasten, um die Autophagie zu aktivieren.'
                    : 'Tip: Try to fast for at least 16 hours to activate autophagy.'
                }
              />
            )}
          </div>
          
          <EnergyCapsule completion={trainingCompletion}>
            <div className="p-6">
              <TrainingCard
                isGerman={isGerman}
                trainingSessions={trainingSessions}
                onTrainingSessionsChange={setTrainingSessions}
                onSaveTrainings={handleSaveTrainings}
                onClearTrainings={handleClearTrainings}
                isSaving={saveTrainingMutation.isPending}
                isLoading={trainingsLoading}
              />
            </div>
          </EnergyCapsule>
          
          <div className="space-y-4">
            <EnergyCapsule completion={sleepCompletion}>
              <div className="p-6">
                <SleepCard
                  isGerman={isGerman}
                  sleepDuration={sleepDuration}
                  sleepQuality={sleepQuality}
                  onSleepDurationChange={setSleepDuration}
                  onSleepQualityChange={setSleepQuality}
                />
              </div>
            </EnergyCapsule>
            {(sleepDuration < 7 || sleepQuality < 6) && (
              <SmartInsight
                type="sleep"
                isGerman={isGerman}
                message={
                  isGerman
                    ? 'Tipp: 7-9 Stunden qualitativ hochwertiger Schlaf sind optimal für die Regeneration.'
                    : 'Tip: 7-9 hours of quality sleep is optimal for recovery.'
                }
              />
            )}
          </div>
          
          <EnergyCapsule completion={stressCompletion}>
            <div className="p-6">
              <StressCard
                isGerman={isGerman}
                systolic={systolic}
                diastolic={diastolic}
                pulse={pulse}
                onSystolicChange={setSystolic}
                onDiastolicChange={setDiastolic}
                onPulseChange={setPulse}
              />
            </div>
          </EnergyCapsule>
          
          <div className="space-y-4">
            <EnergyCapsule completion={nutritionCompletion}>
              <div className="p-6">
                <NutritionCard
                  isGerman={isGerman}
                  proteinIntake={proteinIntake}
                  proteinTarget={calculateProteinTarget()}
                  veggieIntake={veggieIntake}
                  waterIntake={waterIntake}
                  onProteinChange={setProteinIntake}
                  onVeggieChange={setVeggieIntake}
                  onWaterChange={setWaterIntake}
                />
              </div>
            </EnergyCapsule>
            {waterIntake < 1.5 && (
              <SmartInsight
                type="hydration"
                isGerman={isGerman}
                message={
                  isGerman
                    ? 'Tipp: Trinken Sie mindestens 2 Liter Wasser täglich für optimale Hydration.'
                    : 'Tip: Drink at least 2 liters of water daily for optimal hydration.'
                }
              />
            )}
          </div>
        </div>

        <EnergyCapsule completion={supplementCompletion} className="mb-8 p-6">
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

        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            onClick={handleSaveRoutine}
            disabled={completeRoutinesMutation.isPending}
            className="min-w-[300px] shadow-glow-gold hover:shadow-glow-lg cockpit-button luxury-gradient-gold luxury-border-gold"
          >
            {completeRoutinesMutation.isPending
              ? (isGerman ? 'Speichern...' : 'Saving...')
              : (isGerman ? 'Tägliche Routine speichern' : 'Save Daily Routine')}
          </Button>
        </div>
      </div>

      <Dialog open={showRoutineSavedModal} onOpenChange={setShowRoutineSavedModal}>
        <DialogContent className="glass-panel sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <DialogTitle className="text-xl">
                {isGerman ? 'Routine bereits gespeichert' : 'Routine Already Saved'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              {isGerman 
                ? 'Tägliche Routine wurde heute bereits gespeichert. Sie können Ihre Routine nur einmal pro Tag speichern.' 
                : 'Daily routine has already been saved for today. You can only save your daily routine once per calendar day.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowRoutineSavedModal(false)}>
              {isGerman ? 'Verstanden' : 'Understood'}
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
