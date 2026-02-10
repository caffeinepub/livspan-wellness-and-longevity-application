import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { Training, TrainingType, TrainingIntensity } from '../backend';

interface TrainingCardProps {
  trainingSessions: Training[];
  onTrainingSessionsChange: (sessions: Training[]) => void;
  onSaveTrainings: (sessions: Training[]) => Promise<void>;
  onClearTrainings: () => Promise<void>;
  isGerman: boolean;
  isSaving?: boolean;
}

export default function TrainingCard({
  trainingSessions,
  onTrainingSessionsChange,
  onSaveTrainings,
  onClearTrainings,
  isGerman,
  isSaving = false,
}: TrainingCardProps) {
  const [newType, setNewType] = useState<string>('cardio');
  const [newDuration, setNewDuration] = useState<string>('30');
  const [newIntensity, setNewIntensity] = useState<string>('medium');
  const [customType, setCustomType] = useState<string>('');
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  const handleAddSession = () => {
    const duration = parseInt(newDuration);
    if (isNaN(duration) || duration <= 0) return;

    let trainingType: TrainingType;
    if (newType === 'cardio') {
      trainingType = { __kind__: 'cardio', cardio: null };
    } else if (newType === 'strength') {
      trainingType = { __kind__: 'strength', strength: null };
    } else if (newType === 'yoga') {
      trainingType = { __kind__: 'yoga', yoga: null };
    } else {
      trainingType = { __kind__: 'other', other: customType || 'Other' };
    }

    let intensity: TrainingIntensity;
    if (newIntensity === 'low') {
      intensity = TrainingIntensity.low;
    } else if (newIntensity === 'high') {
      intensity = TrainingIntensity.high;
    } else {
      intensity = TrainingIntensity.medium;
    }

    const newSession: Training = {
      trainingType,
      durationMins: BigInt(duration),
      intensity,
    };

    onTrainingSessionsChange([...trainingSessions, newSession]);
    setNewDuration('30');
    setCustomType('');
  };

  const handleRemoveSession = (index: number) => {
    const updated = trainingSessions.filter((_, i) => i !== index);
    onTrainingSessionsChange(updated);
  };

  const handleSave = async () => {
    setIsSavingLocal(true);
    try {
      await onSaveTrainings(trainingSessions);
    } finally {
      setIsSavingLocal(false);
    }
  };

  const getTrainingTypeLabel = (type: TrainingType): string => {
    if (type.__kind__ === 'cardio') return isGerman ? 'Cardio' : 'Cardio';
    if (type.__kind__ === 'strength') return isGerman ? 'Kraft' : 'Strength';
    if (type.__kind__ === 'yoga') return isGerman ? 'Yoga' : 'Yoga';
    return type.other;
  };

  const getIntensityLabel = (intensity: TrainingIntensity): string => {
    if (intensity === TrainingIntensity.low) return isGerman ? 'Niedrig' : 'Low';
    if (intensity === TrainingIntensity.medium) return isGerman ? 'Mittel' : 'Medium';
    return isGerman ? 'Hoch' : 'High';
  };

  return (
    <Card className="glass-panel border-luxury-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 luxury-text-gold">
          <img 
            src="/assets/generated/morning-routine-transparent.dim_64x64.png" 
            alt="Training" 
            className="h-8 w-8"
          />
          {isGerman ? 'Training' : 'Training'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>{isGerman ? 'Typ' : 'Type'}</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardio">{isGerman ? 'Cardio' : 'Cardio'}</SelectItem>
                <SelectItem value="strength">{isGerman ? 'Kraft' : 'Strength'}</SelectItem>
                <SelectItem value="yoga">{isGerman ? 'Yoga' : 'Yoga'}</SelectItem>
                <SelectItem value="other">{isGerman ? 'Andere' : 'Other'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newType === 'other' && (
            <div className="space-y-2">
              <Label>{isGerman ? 'Benutzerdefiniert' : 'Custom'}</Label>
              <Input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder={isGerman ? 'Trainingsart' : 'Training type'}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{isGerman ? 'Dauer (Min)' : 'Duration (min)'}</Label>
            <Input
              type="number"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label>{isGerman ? 'Intensität' : 'Intensity'}</Label>
            <Select value={newIntensity} onValueChange={setNewIntensity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{isGerman ? 'Niedrig' : 'Low'}</SelectItem>
                <SelectItem value="medium">{isGerman ? 'Mittel' : 'Medium'}</SelectItem>
                <SelectItem value="high">{isGerman ? 'Hoch' : 'High'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleAddSession} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {isGerman ? 'Hinzufügen' : 'Add'}
            </Button>
          </div>
        </div>

        {trainingSessions.length > 0 && (
          <div className="space-y-2">
            <Label>{isGerman ? 'Trainingseinheiten' : 'Training Sessions'}</Label>
            <div className="space-y-2">
              {trainingSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-luxury-gold/10"
                >
                  <div className="flex-1">
                    <span className="font-medium text-luxury-gold">
                      {getTrainingTypeLabel(session.trainingType)}
                    </span>
                    <span className="text-muted-foreground mx-2">•</span>
                    <span className="text-foreground">
                      {Number(session.durationMins)} {isGerman ? 'Min' : 'min'}
                    </span>
                    <span className="text-muted-foreground mx-2">•</span>
                    <span className="text-sm text-muted-foreground">
                      {getIntensityLabel(session.intensity)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSession(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || isSavingLocal || trainingSessions.length === 0}
            className="flex-1 bg-gradient-to-r from-luxury-gold-dark to-luxury-gold hover:from-luxury-gold hover:to-luxury-gold-light"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving || isSavingLocal ? (isGerman ? 'Speichern...' : 'Saving...') : (isGerman ? 'Speichern' : 'Save')}
          </Button>
          <Button
            onClick={onClearTrainings}
            disabled={isSaving || isSavingLocal || trainingSessions.length === 0}
            variant="outline"
            className="border-luxury-gold/20 hover:bg-luxury-gold/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isGerman ? 'Löschen' : 'Clear'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
