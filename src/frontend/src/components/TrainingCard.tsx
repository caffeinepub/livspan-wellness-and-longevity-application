import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Save, RotateCcw } from 'lucide-react';
import { TrainingType, TrainingIntensity, Training } from '../backend';

interface TrainingCardProps {
  isGerman: boolean;
  trainingSessions: Training[];
  onTrainingSessionsChange: (sessions: Training[]) => void;
  onSaveTrainings?: () => void;
  onLoadTrainings?: () => void;
  onClearTrainings?: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
}

export default function TrainingCard({ 
  isGerman, 
  trainingSessions, 
  onTrainingSessionsChange,
  onSaveTrainings,
  onLoadTrainings,
  onClearTrainings,
  isSaving = false,
  isLoading = false,
}: TrainingCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [trainingType, setTrainingType] = useState<string>('cardio');
  const [customType, setCustomType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<TrainingIntensity>(TrainingIntensity.medium);
  const [pulseTriggered, setPulseTriggered] = useState(false);

  const handleAddTraining = () => {
    if (!duration || parseInt(duration) <= 0) return;

    let type: TrainingType;
    if (trainingType === 'cardio') {
      type = { __kind__: 'cardio', cardio: null };
    } else if (trainingType === 'strength') {
      type = { __kind__: 'strength', strength: null };
    } else if (trainingType === 'yoga') {
      type = { __kind__: 'yoga', yoga: null };
    } else {
      type = { __kind__: 'other', other: customType || 'Other' };
    }

    const newSession: Training = {
      trainingType: type,
      durationMins: BigInt(parseInt(duration)),
      intensity,
    };

    onTrainingSessionsChange([...trainingSessions, newSession]);
    setDuration('');
    setCustomType('');
    setShowForm(false);
  };

  const handleRemoveTraining = (index: number) => {
    onTrainingSessionsChange(trainingSessions.filter((_, i) => i !== index));
  };

  const handleSaveTrainings = () => {
    if (onSaveTrainings) {
      onSaveTrainings();
      setPulseTriggered(true);
      setTimeout(() => setPulseTriggered(false), 600);
    }
  };

  const getTrainingTypeLabel = (type: TrainingType): string => {
    if (type.__kind__ === 'cardio') return 'Cardio';
    if (type.__kind__ === 'strength') return isGerman ? 'Kraft' : 'Strength';
    if (type.__kind__ === 'yoga') return 'Yoga';
    return type.other;
  };

  const getIntensityLabel = (intensity: TrainingIntensity): string => {
    if (intensity === TrainingIntensity.low) return isGerman ? 'Niedrig' : 'Low';
    if (intensity === TrainingIntensity.medium) return isGerman ? 'Mittel' : 'Medium';
    return isGerman ? 'Hoch' : 'High';
  };

  return (
    <Card className={`glass-panel glass-panel-hover shadow-glass ${pulseTriggered ? 'training-pulse' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/morning-routine-transparent.dim_64x64.png" alt="Training" className="h-8 w-8 drop-shadow-md" />
            <CardTitle className="text-lg luxury-text-gold">{isGerman ? 'Training' : 'Training'}</CardTitle>
          </div>
          <div className="flex gap-2">
            {onSaveTrainings && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSaveTrainings}
                disabled={isSaving || trainingSessions.length === 0}
                className="transition-all duration-200 hover:scale-105 border-luxury-gold/30 hover:bg-luxury-gold/10"
                title={isGerman ? 'Training speichern' : 'Save training'}
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
            {onClearTrainings && trainingSessions.length > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onClearTrainings}
                disabled={isLoading}
                className="transition-all duration-200 hover:scale-105 border-luxury-gold/30 hover:bg-luxury-gold/10"
                title={isGerman ? 'Training löschen' : 'Clear training'}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="transition-all duration-200 hover:scale-105 border-luxury-gold/30 hover:bg-luxury-gold/10">
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {trainingSessions.length > 0 && (
          <div className="space-y-2">
            {trainingSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 backdrop-blur-sm p-3 transition-all duration-200 hover:bg-muted/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getTrainingTypeLabel(session.trainingType)}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{session.durationMins.toString()} min</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{getIntensityLabel(session.intensity)}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveTraining(index)} className="transition-all duration-200 hover:scale-110">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="space-y-4 rounded-lg border border-luxury-gold/30 bg-luxury-gold/5 backdrop-blur-sm p-4">
            <div className="space-y-2">
              <Label htmlFor="training-type">{isGerman ? 'Trainingstyp' : 'Training Type'}</Label>
              <Select value={trainingType} onValueChange={setTrainingType}>
                <SelectTrigger id="training-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="strength">{isGerman ? 'Kraft' : 'Strength'}</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="other">{isGerman ? 'Andere' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {trainingType === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="custom-type">{isGerman ? 'Benutzerdefinierter Typ' : 'Custom Type'}</Label>
                <Input
                  id="custom-type"
                  type="text"
                  placeholder={isGerman ? 'z.B. Pilates, Schwimmen' : 'e.g. Pilates, Swimming'}
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="duration">{isGerman ? 'Dauer (Minuten)' : 'Duration (Minutes)'}</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity">{isGerman ? 'Intensität' : 'Intensity'}</Label>
              <Select value={intensity} onValueChange={(val) => setIntensity(val as TrainingIntensity)}>
                <SelectTrigger id="intensity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TrainingIntensity.low}>{isGerman ? 'Niedrig' : 'Low'}</SelectItem>
                  <SelectItem value={TrainingIntensity.medium}>{isGerman ? 'Mittel' : 'Medium'}</SelectItem>
                  <SelectItem value={TrainingIntensity.high}>{isGerman ? 'Hoch' : 'High'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddTraining} className="w-full transition-all duration-200 hover:scale-105 bg-luxury-gold hover:bg-luxury-gold-bright text-black" disabled={!duration || parseInt(duration) <= 0}>
              {isGerman ? 'Training hinzufügen' : 'Add Training'}
            </Button>
          </div>
        )}

        {trainingSessions.length === 0 && !showForm && (
          <p className="text-center text-sm text-muted-foreground">
            {isGerman ? 'Noch keine Trainingseinheiten' : 'No training sessions yet'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
