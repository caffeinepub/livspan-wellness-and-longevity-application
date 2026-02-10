import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import AutophagyScoreInfo from '../components/AutophagyScoreInfo';
import DailyCoachingCard from '../components/DailyCoachingCard';
import EnergyCapsule from '../components/EnergyCapsule';
import { 
  useCompleteRoutines, 
  useGetCallerUserProfile, 
  useGetBodyComposition, 
  useSaveBodyComposition,
  useGetSupplements,
  useAddSupplement,
  useUpdateSupplement,
  useDeleteSupplement,
  useToggleSupplement,
  useGetAllDailyRoutines,
  useGetTrainings,
  useSaveAllTrainings,
  useClearTrainings,
} from '../hooks/useQueries';
import { toast } from 'sonner';
import { DayRoutines, Training, ColorIndicator } from '../backend';
import { Info } from 'lucide-react';
import { generateDailyCoaching } from '../utils/dailyCoaching';
import { isGerman, getIntensityMultiplier, getIdealBodyFat } from '../utils/backendVariants';

export default function Dashboard() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: bodyComposition, isLoading: bodyCompositionLoading } = useGetBodyComposition();
  const { data: supplements = [] } = useGetSupplements();
  const { data: allRoutinesData } = useGetAllDailyRoutines();
  const { data: savedTrainings = [], isLoading: trainingsLoading, isFetched: trainingsIsFetched } = useGetTrainings();
  const completeRoutinesMutation = useCompleteRoutines();
  const saveBodyCompositionMutation = useSaveBodyComposition();
  const addSupplementMutation = useAddSupplement();
  const updateSupplementMutation = useUpdateSupplement();
  const deleteSupplementMutation = useDeleteSupplement();
  const toggleSupplementMutation = useToggleSupplement();
  const saveAllTrainingsMutation = useSaveAllTrainings();
  const clearTrainingsMutation = useClearTrainings();

  const isGermanLanguage = userProfile?.preferences.language ? isGerman(userProfile.preferences.language) : false;

  const [fastingHours, setFastingHours] = useState(16);
  const [trainingSessions, setTrainingSessions] = useState<Training[]>([]);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [pulse, setPulse] = useState(70);
  const [protein, setProtein] = useState(0);
  const [veggies, setVeggies] = useState(0);
  const [water, setWater] = useState(0);
  const [weight, setWeight] = useState(0);
  const [bodyFat, setBodyFat] = useState(0);
  const [muscleMass, setMuscleMass] = useState(0);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [supplementCompletions, setSupplementCompletions] = useState<Record<string, boolean>>({});

  // Initialize training sessions from backend on load
  useEffect(() => {
    if (trainingsIsFetched && savedTrainings.length > 0 && trainingSessions.length === 0) {
      setTrainingSessions(savedTrainings);
    }
  }, [savedTrainings, trainingsIsFetched, trainingSessions.length]);

  // Initialize body composition from backend
  useEffect(() => {
    if (bodyComposition && !bodyCompositionLoading) {
      setWeight(bodyComposition.currentWeight);
      setBodyFat(bodyComposition.currentBodyFatPercentage);
      setMuscleMass(bodyComposition.currentMuscleMass);
    }
  }, [bodyComposition, bodyCompositionLoading]);

  // Initialize supplement completions
  useEffect(() => {
    const completions: Record<string, boolean> = {};
    supplements.forEach(s => {
      completions[s.id.toString()] = s.completed;
    });
    setSupplementCompletions(completions);
  }, [supplements]);

  const proteinTarget = userProfile ? Math.round(Number(userProfile.bodyHeightCm) * 1.5) : 150;

  const calculateStressIndicator = (): ColorIndicator => {
    if (systolic >= 140 || diastolic >= 90 || pulse >= 100) return 'red' as ColorIndicator;
    if (systolic >= 130 || diastolic >= 85 || pulse >= 85) return 'yellow' as ColorIndicator;
    return 'green' as ColorIndicator;
  };

  const calculateAutophagyScoreComponents = () => {
    const fastingScore = fastingHours < 12 ? 0 : fastingHours < 14 ? 10 : fastingHours < 16 ? 25 : fastingHours < 20 ? 35 : 40;
    
    let trainingScore = 0;
    trainingSessions.forEach(session => {
      const intensityValue = getIntensityMultiplier(session.intensity);
      trainingScore += (Number(session.durationMins) * intensityValue) / 10;
    });
    trainingScore = Math.min(30, trainingScore);

    const durPoints = sleepHours < 5 ? 0 : sleepHours < 7 ? 5 : 10;
    const qualityPoints = sleepQuality <= 5 ? (sleepQuality * 10) / 5 : 10;
    const sleepScore = Math.min(20, durPoints + qualityPoints);

    const rhrPoints = pulse < 60 ? 5 : pulse < 75 ? 3 : 0;
    const bpPoints = (systolic < 120 && diastolic < 80) ? 5 : (systolic > 130 || diastolic > 85) ? 0 : 3;
    const stressScore = Math.min(10, rhrPoints + bpPoints);

    const totalScore = Math.min(100, fastingScore + trainingScore + sleepScore + stressScore);

    return {
      totalScore,
      fastingScore,
      trainingScore,
      sleepScore,
      stressScore,
    };
  };

  const calculateAutophagyScore = (): number => {
    return calculateAutophagyScoreComponents().totalScore;
  };

  const calculateLongevityScore = (): number => {
    const autophagyScore = calculateAutophagyScore();
    
    const idealBodyFat = userProfile?.gender ? getIdealBodyFat(userProfile.gender) : 17.75;
    const bodyFatScore = (bodyFat >= 10.0 && bodyFat <= 25.0) ? 50.0 : Math.max(0, 50.0 - (Math.abs(bodyFat - idealBodyFat) * 2.0));
    const muscleMassScore = (muscleMass >= 10.0 && muscleMass <= 100.0) ? 50.0 * ((muscleMass - 10.0) / 90.0) : 0.0;
    const bodyCompScore = Math.round((bodyFatScore + muscleMassScore) / 2.0);

    const proteinScore = protein >= proteinTarget ? 10 : (protein * 10) / proteinTarget;
    const veggieScore = veggies >= 400 ? 10 : (veggies * 10) / 400;
    const waterScore = water >= 2000 ? 10 : (water * 10) / 2000;
    const nutritionScore = Math.min(30, proteinScore + veggieScore + waterScore);

    const autophagyCouplingScore = (autophagyScore * 20) / 100;

    return Math.min(100, bodyCompScore + nutritionScore + autophagyCouplingScore);
  };

  const autophagyScore = calculateAutophagyScore();
  const longevityScore = calculateLongevityScore();

  const calculateCompletion = (category: 'fasting' | 'training' | 'sleep' | 'stress' | 'nutrition' | 'body' | 'supplements'): number => {
    switch (category) {
      case 'fasting':
        return Math.min(1, fastingHours / 16);
      case 'training':
        return trainingSessions.length > 0 ? Math.min(1, trainingSessions.length / 2) : 0;
      case 'sleep':
        return Math.min(1, (sleepHours / 8 + sleepQuality / 10) / 2);
      case 'stress':
        return systolic > 0 && diastolic > 0 && pulse > 0 ? 1 : 0;
      case 'nutrition':
        return Math.min(1, (protein / proteinTarget + veggies / 400 + water / 2000) / 3);
      case 'body':
        return weight > 0 && bodyFat > 0 && muscleMass > 0 ? 1 : 0;
      case 'supplements':
        if (supplements.length === 0) return 1;
        const completed = supplements.filter(s => supplementCompletions[s.id.toString()]).length;
        return completed / supplements.length;
      default:
        return 0;
    }
  };

  const handleSaveTrainings = async (sessions: Training[]) => {
    try {
      await saveAllTrainingsMutation.mutateAsync(sessions);
      setTrainingSessions(sessions);
      toast.success('Training sessions saved successfully');
    } catch (error) {
      console.error('Error saving training sessions:', error);
      toast.error('Failed to save training sessions');
    }
  };

  const handleClearTrainings = async () => {
    try {
      await clearTrainingsMutation.mutateAsync();
      setTrainingSessions([]);
      toast.success(isGermanLanguage ? 'Trainingseinheiten gelöscht' : 'Training sessions cleared');
    } catch (error) {
      console.error('Error clearing training sessions:', error);
      toast.error(isGermanLanguage ? 'Fehler beim Löschen' : 'Failed to clear training sessions');
    }
  };

  const handleCompleteRoutines = async () => {
    if (!userProfile) {
      toast.error(isGermanLanguage ? 'Profil nicht gefunden' : 'Profile not found');
      return;
    }

    try {
      await saveBodyCompositionMutation.mutateAsync({ weight, bodyFat, muscleMass });

      const routines: DayRoutines = {
        fastingSession: {
          startTimestamp: BigInt(Date.now() - fastingHours * 60 * 60 * 1000),
          endTimestamp: BigInt(Date.now()),
          durationHours: BigInt(fastingHours),
          isCompleted: true,
        },
        trainingSessions,
        sleepMetrics: {
          durationHours: BigInt(sleepHours),
          qualityRating: BigInt(sleepQuality),
        },
        stressMetrics: {
          bloodPressureSystolic: BigInt(systolic),
          bloodPressureDiastolic: BigInt(diastolic),
          pulse: BigInt(pulse),
          stressColorIndicator: calculateStressIndicator(),
        },
        nutritionMetrics: {
          proteinIntake: BigInt(protein),
          veggieIntake: BigInt(veggies),
          waterIntake: BigInt(water),
          proteinTarget: BigInt(proteinTarget),
        },
        bodyComposition: {
          weight,
          bodyFatPercentage: bodyFat,
          muscleMass,
        },
      };

      await completeRoutinesMutation.mutateAsync(routines);
      toast.success(isGermanLanguage ? 'Routinen erfolgreich abgeschlossen!' : 'Routines completed successfully!');
    } catch (error: any) {
      console.error('Error completing routines:', error);
      if (error.message?.includes('already completed')) {
        toast.error(isGermanLanguage ? 'Routine heute bereits abgeschlossen' : 'Routine already completed today');
      } else {
        toast.error(isGermanLanguage ? 'Fehler beim Abschließen der Routinen' : 'Error completing routines');
      }
    }
  };

  const handleAddSupplement = async (name: string, dosage: string, time: string, note: string | null) => {
    try {
      await addSupplementMutation.mutateAsync({ name, dosage, time, note });
      toast.success(isGermanLanguage ? 'Supplement hinzugefügt' : 'Supplement added');
    } catch (error) {
      console.error('Error adding supplement:', error);
      toast.error(isGermanLanguage ? 'Fehler beim Hinzufügen' : 'Failed to add supplement');
    }
  };

  const handleUpdateSupplement = async (supplementId: bigint, name: string, dosage: string, time: string, note: string | null) => {
    try {
      await updateSupplementMutation.mutateAsync({ supplementId, name, dosage, time, note });
      toast.success(isGermanLanguage ? 'Supplement aktualisiert' : 'Supplement updated');
    } catch (error) {
      console.error('Error updating supplement:', error);
      toast.error(isGermanLanguage ? 'Fehler beim Aktualisieren' : 'Failed to update supplement');
    }
  };

  const handleDeleteSupplement = async (supplementId: bigint) => {
    try {
      await deleteSupplementMutation.mutateAsync(supplementId);
      toast.success(isGermanLanguage ? 'Supplement gelöscht' : 'Supplement deleted');
    } catch (error) {
      console.error('Error deleting supplement:', error);
      toast.error(isGermanLanguage ? 'Fehler beim Löschen' : 'Failed to delete supplement');
    }
  };

  const handleToggleSupplement = (id: bigint) => {
    setSupplementCompletions(prev => ({
      ...prev,
      [id.toString()]: !prev[id.toString()]
    }));
    toggleSupplementMutation.mutate(id);
  };

  const coachingSteps = generateDailyCoaching({
    routines: {
      fastingHours,
      trainingSessions: trainingSessions.length,
      sleepDuration: sleepHours,
      sleepQuality,
      systolic,
      diastolic,
      pulse,
      proteinIntake: protein,
      proteinTarget,
      veggieIntake: veggies,
      waterIntake: water / 1000,
      bodyFat,
      muscleMass,
    },
    scores: {
      autophagy: autophagyScore,
      longevity: longevityScore,
    },
  });

  return (
    <div className="min-h-screen pb-20 pt-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/assets/generated/luxury-bg-01.dim_2400x1350.png')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-[url('/assets/generated/gold-caustics-overlay.dim_2400x1350.png')] bg-cover bg-center opacity-[0.03] animate-caustics" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <DailyCoachingCard steps={coachingSteps} insights={[]} isGerman={isGermanLanguage} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowScoreInfo(true)}
                    className="relative group"
                  >
                    <ScoreRing score={autophagyScore} size={200} label={isGermanLanguage ? 'Autophagie' : 'Autophagy'} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="h-5 w-5 text-luxury-gold" />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isGermanLanguage ? 'Klicken für Details' : 'Click for details'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex flex-col items-center justify-center">
            <ScoreRing score={longevityScore} size={200} label={isGermanLanguage ? 'Langlebigkeit' : 'Longevity'} />
          </div>
        </div>

        <SmartInsightsOverlay score={autophagyScore} scoreType="autophagy" isGerman={isGermanLanguage} />

        <div className="space-y-8">
          <EnergyCapsule completion={calculateCompletion('fasting')} accentMode="gold">
            <FastingTimer
              fastingHours={fastingHours}
              onFastingDurationChange={setFastingHours}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={calculateCompletion('training')} accentMode="jade">
            <TrainingCard
              trainingSessions={trainingSessions}
              onTrainingSessionsChange={setTrainingSessions}
              onSaveTrainings={handleSaveTrainings}
              onClearTrainings={handleClearTrainings}
              isGerman={isGermanLanguage}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={calculateCompletion('sleep')} accentMode="emerald">
            <SleepCard
              sleepDuration={sleepHours}
              sleepQuality={sleepQuality}
              onSleepDurationChange={setSleepHours}
              onSleepQualityChange={setSleepQuality}
              isGerman={isGermanLanguage}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={calculateCompletion('stress')} accentMode="gold">
            <StressCard
              systolic={systolic}
              diastolic={diastolic}
              pulse={pulse}
              onSystolicChange={setSystolic}
              onDiastolicChange={setDiastolic}
              onPulseChange={setPulse}
              isGerman={isGermanLanguage}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={calculateCompletion('nutrition')} accentMode="jade">
            <NutritionCard
              proteinIntake={protein}
              veggieIntake={veggies}
              waterIntake={water}
              proteinTarget={proteinTarget}
              onProteinChange={setProtein}
              onVeggieChange={setVeggies}
              onWaterChange={setWater}
              isGerman={isGermanLanguage}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={calculateCompletion('body')} accentMode="emerald">
            <BodyCompositionCard
              weight={weight}
              bodyFat={bodyFat}
              muscleMass={muscleMass}
              bmi={bodyComposition?.bmi ?? null}
              bmiCategory={bodyComposition?.bmiCategory ?? null}
              onWeightChange={setWeight}
              onBodyFatChange={setBodyFat}
              onMuscleMassChange={setMuscleMass}
              isGerman={isGermanLanguage}
            />
          </EnergyCapsule>

          <EnergyCapsule completion={calculateCompletion('supplements')} accentMode="gold">
            <SupplementCard
              supplements={supplements}
              supplementCompletions={supplementCompletions}
              onToggleSupplement={handleToggleSupplement}
              onAddSupplement={handleAddSupplement}
              onUpdateSupplement={handleUpdateSupplement}
              onDeleteSupplement={handleDeleteSupplement}
              isGerman={isGermanLanguage}
            />
          </EnergyCapsule>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleCompleteRoutines}
            disabled={completeRoutinesMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-luxury-gold-dark via-luxury-gold to-luxury-gold-light hover:from-luxury-gold hover:via-luxury-gold-light hover:to-luxury-gold text-black font-semibold px-12 py-6 text-lg shadow-lg shadow-luxury-gold/30 hover:shadow-luxury-gold/50 transition-all duration-300"
          >
            {completeRoutinesMutation.isPending
              ? (isGermanLanguage ? 'Wird gespeichert...' : 'Saving...')
              : (isGermanLanguage ? 'Routinen abschließen' : 'Complete Routines')}
          </Button>
        </div>
      </div>

      <AutophagyScoreInfo
        isOpen={showScoreInfo}
        onClose={() => setShowScoreInfo(false)}
        scoreData={calculateAutophagyScoreComponents()}
        isGerman={isGermanLanguage}
      />
    </div>
  );
}
