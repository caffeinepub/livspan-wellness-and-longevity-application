import { useGetAllDailyRoutines, useGetBodyComposition, useGetCallerUserProfile, useResetAnalyses } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, TrendingUp, TrendingDown, Minus, Activity, Moon, Heart, Apple, Dumbbell, Zap, Target, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function AnalysisPage() {
  const { data: routinesData, isLoading: routinesLoading } = useGetAllDailyRoutines();
  const { data: bodyComposition, isLoading: bodyLoading } = useGetBodyComposition();
  const { data: userProfile } = useGetCallerUserProfile();
  const resetAnalyses = useResetAnalyses();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const language = userProfile?.preferences.language || 'en';
  const isGerman = language === 'de';

  const handleResetAnalyses = async () => {
    try {
      await resetAnalyses.mutateAsync();
      setIsResetDialogOpen(false);
      toast.success(
        isGerman 
          ? 'Alle Analysedaten wurden erfolgreich gelöscht' 
          : 'All analysis data has been successfully deleted',
        {
          className: 'glass-panel',
          duration: 3000,
        }
      );
    } catch (error) {
      console.error('Failed to reset analyses:', error);
      toast.error(
        isGerman 
          ? 'Fehler beim Löschen der Analysedaten' 
          : 'Failed to delete analysis data',
        {
          className: 'glass-panel',
          duration: 3000,
        }
      );
    }
  };

  const getScoreColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 70) return '#10b981'; // green
    if (percentage >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const stats = useMemo(() => {
    if (!routinesData || routinesData.routines.length === 0) {
      return null;
    }

    const routines = routinesData.routines.map(([_, data]) => data);
    const count = routines.length;

    // Fasting stats
    const fastingDurations = routines.map(r => Number(r.routines.fastingSession.durationHours));
    const avgFasting = fastingDurations.reduce((a, b) => a + b, 0) / count;
    const maxFasting = Math.max(...fastingDurations);
    const minFasting = Math.min(...fastingDurations);

    // Sleep stats
    const sleepDurations = routines.map(r => Number(r.routines.sleepMetrics.durationHours));
    const sleepQualities = routines.map(r => Number(r.routines.sleepMetrics.qualityRating));
    const avgSleepDuration = sleepDurations.reduce((a, b) => a + b, 0) / count;
    const avgSleepQuality = sleepQualities.reduce((a, b) => a + b, 0) / count;

    // Stress stats
    const systolicBP = routines.map(r => Number(r.routines.stressMetrics.bloodPressureSystolic));
    const diastolicBP = routines.map(r => Number(r.routines.stressMetrics.bloodPressureDiastolic));
    const pulseRates = routines.map(r => Number(r.routines.stressMetrics.pulse));
    const avgSystolic = systolicBP.reduce((a, b) => a + b, 0) / count;
    const avgDiastolic = diastolicBP.reduce((a, b) => a + b, 0) / count;
    const avgPulse = pulseRates.reduce((a, b) => a + b, 0) / count;

    // Nutrition stats
    const proteinIntakes = routines.map(r => Number(r.routines.nutritionMetrics.proteinIntake));
    const veggieIntakes = routines.map(r => Number(r.routines.nutritionMetrics.veggieIntake));
    const waterIntakes = routines.map(r => Number(r.routines.nutritionMetrics.waterIntake));
    const avgProtein = proteinIntakes.reduce((a, b) => a + b, 0) / count;
    const avgVeggies = veggieIntakes.reduce((a, b) => a + b, 0) / count;
    const avgWater = waterIntakes.reduce((a, b) => a + b, 0) / count;

    // Training stats
    const totalTrainingSessions = routines.reduce((sum, r) => sum + r.routines.trainingSessions.length, 0);
    const avgTrainingSessions = totalTrainingSessions / count;

    // Autophagy Score stats
    const autophagyScores = routines.map(r => Number(r.autophagyScore.totalScore));
    const avgAutophagyScore = autophagyScores.reduce((a, b) => a + b, 0) / count;
    const maxAutophagyScore = Math.max(...autophagyScores);
    const minAutophagyScore = Math.min(...autophagyScores);

    // Autophagy component averages
    const avgFastingScore = routines.reduce((sum, r) => sum + Number(r.autophagyScore.fastingScore), 0) / count;
    const avgTrainingScore = routines.reduce((sum, r) => sum + Number(r.autophagyScore.trainingScore), 0) / count;
    const avgSleepScore = routines.reduce((sum, r) => sum + Number(r.autophagyScore.sleepScore), 0) / count;
    const avgStressScore = routines.reduce((sum, r) => sum + Number(r.autophagyScore.stressScore), 0) / count;

    // Longevity Score stats
    const longevityScores = routines.map(r => Number(r.longevityScore.totalScore));
    const avgLongevityScore = longevityScores.reduce((a, b) => a + b, 0) / count;
    const maxLongevityScore = Math.max(...longevityScores);
    const minLongevityScore = Math.min(...longevityScores);

    // Longevity component averages
    const avgBodyCompScore = routines.reduce((sum, r) => sum + Number(r.longevityScore.bodyCompositionScore), 0) / count;
    const avgNutritionScore = routines.reduce((sum, r) => sum + Number(r.longevityScore.nutritionScore), 0) / count;
    const avgAutophagyCouplingScore = routines.reduce((sum, r) => sum + Number(r.longevityScore.autophagyCouplingScore), 0) / count;

    // Chart data
    const chartData = routines.map((r, idx) => ({
      day: idx + 1,
      autophagy: Number(r.autophagyScore.totalScore),
      longevity: Number(r.longevityScore.totalScore),
      fasting: Number(r.routines.fastingSession.durationHours),
      sleepDuration: Number(r.routines.sleepMetrics.durationHours),
      sleepQuality: Number(r.routines.sleepMetrics.qualityRating),
      systolic: Number(r.routines.stressMetrics.bloodPressureSystolic),
      diastolic: Number(r.routines.stressMetrics.bloodPressureDiastolic),
      pulse: Number(r.routines.stressMetrics.pulse),
      protein: Number(r.routines.nutritionMetrics.proteinIntake),
      veggies: Number(r.routines.nutritionMetrics.veggieIntake),
      water: Number(r.routines.nutritionMetrics.waterIntake),
    }));

    return {
      count,
      fasting: { avg: avgFasting, max: maxFasting, min: minFasting, data: fastingDurations },
      sleep: { avgDuration: avgSleepDuration, avgQuality: avgSleepQuality, durations: sleepDurations, qualities: sleepQualities },
      stress: { avgSystolic, avgDiastolic, avgPulse, systolic: systolicBP, diastolic: diastolicBP, pulse: pulseRates },
      nutrition: { avgProtein, avgVeggies, avgWater, protein: proteinIntakes, veggies: veggieIntakes, water: waterIntakes },
      training: { avgSessions: avgTrainingSessions, total: totalTrainingSessions },
      autophagy: {
        avg: avgAutophagyScore,
        max: maxAutophagyScore,
        min: minAutophagyScore,
        scores: autophagyScores,
        components: {
          fasting: avgFastingScore,
          training: avgTrainingScore,
          sleep: avgSleepScore,
          stress: avgStressScore,
        }
      },
      longevity: {
        avg: avgLongevityScore,
        max: maxLongevityScore,
        min: minLongevityScore,
        scores: longevityScores,
        components: {
          bodyComposition: avgBodyCompScore,
          nutrition: avgNutritionScore,
          autophagyCoupling: avgAutophagyCouplingScore,
        }
      },
      chartData,
    };
  }, [routinesData]);

  const bodyStats = useMemo(() => {
    if (!bodyComposition || !bodyComposition.history || bodyComposition.history.length === 0) {
      return null;
    }

    const history = bodyComposition.history;
    const count = history.length;

    const weights = history.map(h => h.weight);
    const bodyFats = history.map(h => h.bodyFatPercentage);
    const muscleMasses = history.map(h => h.muscleMass);

    const avgWeight = weights.reduce((a, b) => a + b, 0) / count;
    const avgBodyFat = bodyFats.reduce((a, b) => a + b, 0) / count;
    const avgMuscleMass = muscleMasses.reduce((a, b) => a + b, 0) / count;

    const weightTrend = count > 1 ? weights[weights.length - 1] - weights[0] : 0;
    const bodyFatTrend = count > 1 ? bodyFats[bodyFats.length - 1] - bodyFats[0] : 0;
    const muscleMassTrend = count > 1 ? muscleMasses[muscleMasses.length - 1] - muscleMasses[0] : 0;

    const bodyChartData = history.map((h, idx) => ({
      day: idx + 1,
      weight: h.weight,
      bodyFat: h.bodyFatPercentage,
      muscleMass: h.muscleMass,
    }));

    return {
      count,
      avgWeight,
      avgBodyFat,
      avgMuscleMass,
      weightTrend,
      bodyFatTrend,
      muscleMassTrend,
      current: {
        weight: bodyComposition.currentWeight,
        bodyFat: bodyComposition.currentBodyFatPercentage,
        muscleMass: bodyComposition.currentMuscleMass,
        bmi: bodyComposition.bmi,
      },
      chartData: bodyChartData,
    };
  }, [bodyComposition]);

  const getTrendIcon = (value: number) => {
    if (value > 0.5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < -0.5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  if (routinesLoading || bodyLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {isGerman ? 'Analyse' : 'Analysis'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isGerman
                ? 'Übersicht über Ihre Gesundheitsdaten und Trends'
                : 'Overview of your health data and trends'}
            </p>
          </div>
          <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="gap-2">
                <Trash2 className="h-5 w-5" />
                {isGerman ? 'Analysen zurücksetzen' : 'Reset Analyses'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-panel">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isGerman ? 'Analysen zurücksetzen?' : 'Reset Analyses?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isGerman
                    ? 'Sind Sie sicher, dass Sie alle Analysedaten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
                    : 'Are you sure you want to delete all analysis data? This action cannot be undone.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {isGerman ? 'Abbrechen' : 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetAnalyses}
                  disabled={resetAnalyses.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {resetAnalyses.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isGerman ? 'Wird gelöscht...' : 'Deleting...'}
                    </>
                  ) : (
                    <>{isGerman ? 'Löschen' : 'Delete'}</>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Routinen' : 'Routines'}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isGerman ? 'Gesamt' : 'Total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Ø Autophagie' : 'Avg Autophagy'}
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.autophagy.avg.toFixed(0) || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isGerman ? 'von 100' : 'out of 100'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Ø Langlebigkeit' : 'Avg Longevity'}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.longevity.avg.toFixed(0) || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isGerman ? 'von 100' : 'out of 100'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Ø Fasten' : 'Avg Fasting'}
            </CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.fasting.avg.toFixed(1) || 0}h</div>
            <p className="text-xs text-muted-foreground">
              {isGerman ? 'Durchschnitt' : 'Average'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Ø Schlaf' : 'Avg Sleep'}
            </CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sleep.avgDuration.toFixed(1) || 0}h</div>
            <p className="text-xs text-muted-foreground">
              {isGerman ? 'Qualität: ' : 'Quality: '}{stats?.sleep.avgQuality.toFixed(1) || 0}/10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Ø Training' : 'Avg Training'}
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.training.avgSessions.toFixed(1) || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isGerman ? 'Einheiten/Tag' : 'Sessions/day'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="longevity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="longevity">{isGerman ? 'Langlebigkeit' : 'Longevity'}</TabsTrigger>
          <TabsTrigger value="autophagy">{isGerman ? 'Autophagie' : 'Autophagy'}</TabsTrigger>
          <TabsTrigger value="fasting">{isGerman ? 'Fasten' : 'Fasting'}</TabsTrigger>
          <TabsTrigger value="sleep">{isGerman ? 'Schlaf' : 'Sleep'}</TabsTrigger>
          <TabsTrigger value="stress">{isGerman ? 'Stress' : 'Stress'}</TabsTrigger>
          <TabsTrigger value="nutrition">{isGerman ? 'Ernährung' : 'Nutrition'}</TabsTrigger>
          <TabsTrigger value="body">{isGerman ? 'Körper' : 'Body'}</TabsTrigger>
        </TabsList>

        {/* Longevity Tab */}
        <TabsContent value="longevity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Langlebigkeits-Score Trend' : 'Longevity Score Trend'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Entwicklung Ihres Langlebigkeits-Scores über die Zeit'
                  : 'Evolution of your Longevity Score over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Tag' : 'Day', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      domain={[0, 100]}
                      label={{ value: isGerman ? 'Score' : 'Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="longevity" 
                      stroke="url(#longevityGradient)" 
                      strokeWidth={3}
                      name={isGerman ? 'Langlebigkeits-Score' : 'Longevity Score'}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <defs>
                      <linearGradient id="longevityGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Langlebigkeits-Score Statistiken' : 'Longevity Score Statistics'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Übersicht über Ihre Langlebigkeits-Scores und Komponenten'
                  : 'Overview of your Longevity Scores and components'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Durchschnitt' : 'Average'}
                      </p>
                      <p className="text-2xl font-bold">{stats.longevity.avg.toFixed(0)}/100</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Maximum' : 'Maximum'}
                      </p>
                      <p className="text-2xl font-bold">{stats.longevity.max}/100</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Minimum' : 'Minimum'}
                      </p>
                      <p className="text-2xl font-bold">{stats.longevity.min}/100</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">
                      {isGerman ? 'Durchschnittliche Komponenten-Scores' : 'Average Component Scores'}
                    </h4>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="glass-panel rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{isGerman ? 'Körperzusammensetzung (50%)' : 'Body Composition (50%)'}</p>
                          <Badge variant="outline">{stats.longevity.components.bodyComposition.toFixed(0)}/50</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                            style={{ width: `${(stats.longevity.components.bodyComposition / 50) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="glass-panel rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{isGerman ? 'Ernährungsqualität (30%)' : 'Nutrition Quality (30%)'}</p>
                          <Badge variant="outline">{stats.longevity.components.nutrition.toFixed(0)}/30</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                            style={{ width: `${(stats.longevity.components.nutrition / 30) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="glass-panel rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{isGerman ? 'Autophagie-Kopplung (20%)' : 'Autophagy Coupling (20%)'}</p>
                          <Badge variant="outline">{stats.longevity.components.autophagyCoupling.toFixed(0)}/20</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                            style={{ width: `${(stats.longevity.components.autophagyCoupling / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Autophagy Tab */}
        <TabsContent value="autophagy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Autophagie-Score Trend' : 'Autophagy Score Trend'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Entwicklung Ihres Autophagie-Scores über die Zeit'
                  : 'Evolution of your Autophagy Score over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Tag' : 'Day', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      domain={[0, 100]}
                      label={{ value: isGerman ? 'Score' : 'Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="autophagy" 
                      stroke="url(#autophagyGradient)" 
                      strokeWidth={3}
                      name={isGerman ? 'Autophagie-Score' : 'Autophagy Score'}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <defs>
                      <linearGradient id="autophagyGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Autophagie-Score Statistiken' : 'Autophagy Score Statistics'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Übersicht über Ihre Autophagie-Scores und Komponenten'
                  : 'Overview of your Autophagy Scores and components'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Durchschnitt' : 'Average'}
                      </p>
                      <p className="text-2xl font-bold">{stats.autophagy.avg.toFixed(0)}/100</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Maximum' : 'Maximum'}
                      </p>
                      <p className="text-2xl font-bold">{stats.autophagy.max}/100</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Minimum' : 'Minimum'}
                      </p>
                      <p className="text-2xl font-bold">{stats.autophagy.min}/100</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">
                      {isGerman ? 'Durchschnittliche Komponenten-Scores' : 'Average Component Scores'}
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="glass-panel rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{isGerman ? 'Fasten (40%)' : 'Fasting (40%)'}</p>
                          <Badge variant="outline">{stats.autophagy.components.fasting.toFixed(0)}/40</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                            style={{ width: `${(stats.autophagy.components.fasting / 40) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="glass-panel rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{isGerman ? 'Training (30%)' : 'Training (30%)'}</p>
                          <Badge variant="outline">{stats.autophagy.components.training.toFixed(0)}/30</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                            style={{ width: `${(stats.autophagy.components.training / 30) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="glass-panel rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{isGerman ? 'Schlaf (20%)' : 'Sleep (20%)'}</p>
                          <Badge variant="outline">{stats.autophagy.components.sleep.toFixed(0)}/20</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                            style={{ width: `${(stats.autophagy.components.sleep / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="glass-panel rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{isGerman ? 'Stress (10%)' : 'Stress (10%)'}</p>
                          <Badge variant="outline">{stats.autophagy.components.stress.toFixed(0)}/10</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                            style={{ width: `${(stats.autophagy.components.stress / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fasting Tab */}
        <TabsContent value="fasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Fasten-Trend' : 'Fasting Trend'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Entwicklung Ihrer Fastenzeiten über die Zeit'
                  : 'Evolution of your fasting durations over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Tag' : 'Day', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Stunden' : 'Hours', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="fasting" 
                      stroke="url(#fastingGradient)" 
                      strokeWidth={3}
                      name={isGerman ? 'Fastendauer (h)' : 'Fasting Duration (h)'}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <defs>
                      <linearGradient id="fastingGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Schlaf-Trend' : 'Sleep Trend'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Entwicklung Ihrer Schlafdaten über die Zeit'
                  : 'Evolution of your sleep data over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Tag' : 'Day', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Wert' : 'Value', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sleepDuration" 
                      stroke="url(#sleepDurationGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Dauer (h)' : 'Duration (h)'}
                      dot={{ fill: '#3b82f6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sleepQuality" 
                      stroke="url(#sleepQualityGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Qualität (0-10)' : 'Quality (0-10)'}
                      dot={{ fill: '#8b5cf6' }}
                    />
                    <defs>
                      <linearGradient id="sleepDurationGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="sleepQualityGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stress Tab */}
        <TabsContent value="stress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Stress-Trend' : 'Stress Trend'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Entwicklung von Blutdruck und Puls über die Zeit'
                  : 'Evolution of blood pressure and pulse over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Tag' : 'Day', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Wert' : 'Value', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="url(#systolicGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Systolisch (mmHg)' : 'Systolic (mmHg)'}
                      dot={{ fill: '#ef4444' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="url(#diastolicGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Diastolisch (mmHg)' : 'Diastolic (mmHg)'}
                      dot={{ fill: '#f97316' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pulse" 
                      stroke="url(#pulseGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Puls (bpm)' : 'Pulse (bpm)'}
                      dot={{ fill: '#ec4899' }}
                    />
                    <defs>
                      <linearGradient id="systolicGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="diastolicGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Ernährungs-Trend' : 'Nutrition Trend'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Entwicklung Ihrer Ernährungsdaten über die Zeit'
                  : 'Evolution of your nutrition data over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Tag' : 'Day', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Menge' : 'Amount', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="protein" 
                      stroke="url(#proteinGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Protein (g)' : 'Protein (g)'}
                      dot={{ fill: '#3b82f6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="veggies" 
                      stroke="url(#veggiesGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Gemüse (g)' : 'Vegetables (g)'}
                      dot={{ fill: '#10b981' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="water" 
                      stroke="url(#waterGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Wasser (ml)' : 'Water (ml)'}
                      dot={{ fill: '#06b6d4' }}
                    />
                    <defs>
                      <linearGradient id="proteinGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="veggiesGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="waterGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body Composition Tab */}
        <TabsContent value="body" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Körperzusammensetzungs-Trend' : 'Body Composition Trend'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Entwicklung Ihrer Körperdaten über die Zeit'
                  : 'Evolution of your body composition data over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bodyStats && bodyStats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bodyStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Tag' : 'Day', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: isGerman ? 'Wert' : 'Value', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="url(#weightGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Gewicht (kg)' : 'Weight (kg)'}
                      dot={{ fill: '#3b82f6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="url(#bodyFatGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Körperfett (%)' : 'Body Fat (%)'}
                      dot={{ fill: '#f59e0b' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="muscleMass" 
                      stroke="url(#muscleMassGradient)" 
                      strokeWidth={2}
                      name={isGerman ? 'Muskelmasse (kg)' : 'Muscle Mass (kg)'}
                      dot={{ fill: '#10b981' }}
                    />
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="muscleMassGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isGerman ? 'Körperzusammensetzung' : 'Body Composition'}</CardTitle>
              <CardDescription>
                {isGerman
                  ? 'Übersicht über Ihre Körperdaten'
                  : 'Overview of your body composition data'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bodyStats ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Aktuelles Gewicht' : 'Current Weight'}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{bodyStats.current.weight.toFixed(1)} kg</p>
                        {getTrendIcon(bodyStats.weightTrend)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bodyStats.weightTrend > 0 ? '+' : ''}{bodyStats.weightTrend.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Körperfett' : 'Body Fat'}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{bodyStats.current.bodyFat.toFixed(1)}%</p>
                        {getTrendIcon(bodyStats.bodyFatTrend)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bodyStats.bodyFatTrend > 0 ? '+' : ''}{bodyStats.bodyFatTrend.toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {isGerman ? 'Muskelmasse' : 'Muscle Mass'}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{bodyStats.current.muscleMass.toFixed(1)} kg</p>
                        {getTrendIcon(bodyStats.muscleMassTrend)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bodyStats.muscleMassTrend > 0 ? '+' : ''}{bodyStats.muscleMassTrend.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">BMI</p>
                      <p className="text-2xl font-bold">{bodyStats.current.bmi.toFixed(1)}</p>
                      <Badge variant={bodyComposition?.bmiCategory === 'optimal' ? 'default' : 'secondary'}>
                        {bodyComposition?.bmiCategory}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  {isGerman ? 'Keine Daten verfügbar' : 'No data available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
