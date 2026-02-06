import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Save, X, Edit, Trash2 } from 'lucide-react';
import type { SupplementEntry } from '../backend';

interface SupplementCardProps {
  isGerman: boolean;
  supplements: SupplementEntry[];
  supplementCompletions: Record<string, boolean>;
  onAddSupplement: (name: string, dosage: string, time: string, note: string | null) => Promise<void>;
  onUpdateSupplement: (supplementId: bigint, name: string, dosage: string, time: string, note: string | null) => Promise<void>;
  onDeleteSupplement: (supplementId: bigint) => Promise<void>;
  onToggleSupplement: (id: bigint) => void;
}

export default function SupplementCard({
  isGerman,
  supplements,
  supplementCompletions,
  onAddSupplement,
  onUpdateSupplement,
  onDeleteSupplement,
  onToggleSupplement,
}: SupplementCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNote, setNewNote] = useState('');

  const [editName, setEditName] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleAddClick = () => {
    setIsAdding(true);
    setNewName('');
    setNewDosage('');
    setNewTime('');
    setNewNote('');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewName('');
    setNewDosage('');
    setNewTime('');
    setNewNote('');
  };

  const handleSaveNew = async () => {
    if (!newName.trim() || !newDosage.trim() || !newTime.trim()) {
      return;
    }

    await onAddSupplement(
      newName.trim(),
      newDosage.trim(),
      newTime.trim(),
      newNote.trim() || null
    );

    setIsAdding(false);
    setNewName('');
    setNewDosage('');
    setNewTime('');
    setNewNote('');
  };

  const handleEditClick = (supplement: SupplementEntry) => {
    setEditingId(supplement.id);
    setEditName(supplement.name);
    setEditDosage(supplement.dosage);
    setEditTime(supplement.time);
    setEditNote(supplement.note || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDosage('');
    setEditTime('');
    setEditNote('');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim() || !editDosage.trim() || !editTime.trim()) {
      return;
    }

    await onUpdateSupplement(
      editingId,
      editName.trim(),
      editDosage.trim(),
      editTime.trim(),
      editNote.trim() || null
    );

    setEditingId(null);
    setEditName('');
    setEditDosage('');
    setEditTime('');
    setEditNote('');
  };

  const handleDelete = async (supplementId: bigint) => {
    if (window.confirm(isGerman ? 'Möchten Sie dieses Supplement wirklich löschen?' : 'Are you sure you want to delete this supplement?')) {
      await onDeleteSupplement(supplementId);
    }
  };

  const sortedSupplements = [...supplements].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    const minutesA = (timeA[0] || 0) * 60 + (timeA[1] || 0);
    const minutesB = (timeB[0] || 0) * 60 + (timeB[1] || 0);
    return minutesA - minutesB;
  });

  const completedCount = sortedSupplements.filter(s => supplementCompletions[s.id.toString()]).length;
  const totalCount = sortedSupplements.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const supplementGradientStops = [
    { position: 0, color: 'oklch(0.55 0.22 25)' },
    { position: 50, color: 'oklch(0.75 0.15 85)' },
    { position: 80, color: 'oklch(0.60 0.16 155)' },
    { position: 100, color: 'oklch(0.65 0.14 175)' },
  ];

  const createGradientString = (stops: typeof supplementGradientStops) => {
    return stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');
  };

  return (
    <Card className="glass-panel glass-panel-hover shadow-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/generated/supplement-icon-transparent.dim_64x64.png" 
              alt={isGerman ? 'Supplement Einnahme' : 'Supplement Intake'} 
              className="h-8 w-8 drop-shadow-md" 
            />
            <CardTitle className="text-lg text-luxury-gold">
              {isGerman ? 'Supplement Einnahme' : 'Supplement Intake'}
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddClick}
            disabled={isAdding}
            className="transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-1" />
            {isGerman ? 'Hinzufügen' : 'Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {totalCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-accent">
                  {isGerman ? 'Täglicher Fortschritt' : 'Daily Progress'}
                </Label>
                <span className="text-xs font-semibold text-luxury-gold">
                  {completedCount}/{totalCount} ({completionPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30 backdrop-blur-sm">
                <div
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${completionPercentage}%`,
                    background: `linear-gradient(to right, ${createGradientString(supplementGradientStops)})`
                  }}
                />
              </div>
            </div>
          )}

          {isAdding && (
            <div className="p-4 border rounded-lg bg-muted/20 backdrop-blur-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-name" className="text-xs">
                    {isGerman ? 'Name' : 'Name'}
                  </Label>
                  <Input
                    id="new-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={isGerman ? 'z.B. Vitamin D3' : 'e.g. Vitamin D3'}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="new-dosage" className="text-xs">
                    {isGerman ? 'Dosierung' : 'Dosage'}
                  </Label>
                  <Input
                    id="new-dosage"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder={isGerman ? 'z.B. 2000 IU' : 'e.g. 2000 IU'}
                    className="h-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="new-time" className="text-xs">
                  {isGerman ? 'Uhrzeit' : 'Time'}
                </Label>
                <Input
                  id="new-time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="new-note" className="text-xs">
                  {isGerman ? 'Notiz (optional)' : 'Note (optional)'}
                </Label>
                <Textarea
                  id="new-note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={isGerman ? 'Zusätzliche Hinweise...' : 'Additional notes...'}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={handleCancelAdd} className="transition-all duration-200 hover:scale-105">
                  <X className="h-4 w-4 mr-1" />
                  {isGerman ? 'Abbrechen' : 'Cancel'}
                </Button>
                <Button size="sm" onClick={handleSaveNew} className="transition-all duration-200 hover:scale-105">
                  <Save className="h-4 w-4 mr-1" />
                  {isGerman ? 'Speichern' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {sortedSupplements.length === 0 && !isAdding && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isGerman 
                ? 'Keine Supplements hinzugefügt. Klicken Sie auf "Hinzufügen", um zu beginnen.' 
                : 'No supplements added. Click "Add" to get started.'}
            </p>
          )}

          {sortedSupplements.map((supplement) => {
            const idStr = supplement.id.toString();
            const isCompleted = supplementCompletions[idStr] || false;
            const isEditing = editingId?.toString() === idStr;

            if (isEditing) {
              return (
                <div key={supplement.id.toString()} className="p-4 border rounded-lg bg-muted/20 backdrop-blur-sm space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`edit-name-${idStr}`} className="text-xs">
                        {isGerman ? 'Name' : 'Name'}
                      </Label>
                      <Input
                        id={`edit-name-${idStr}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-dosage-${idStr}`} className="text-xs">
                        {isGerman ? 'Dosierung' : 'Dosage'}
                      </Label>
                      <Input
                        id={`edit-dosage-${idStr}`}
                        value={editDosage}
                        onChange={(e) => setEditDosage(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`edit-time-${idStr}`} className="text-xs">
                      {isGerman ? 'Uhrzeit' : 'Time'}
                    </Label>
                    <Input
                      id={`edit-time-${idStr}`}
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-note-${idStr}`} className="text-xs">
                      {isGerman ? 'Notiz (optional)' : 'Note (optional)'}
                    </Label>
                    <Textarea
                      id={`edit-note-${idStr}`}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="transition-all duration-200 hover:scale-105">
                      <X className="h-4 w-4 mr-1" />
                      {isGerman ? 'Abbrechen' : 'Cancel'}
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit} className="transition-all duration-200 hover:scale-105">
                      <Save className="h-4 w-4 mr-1" />
                      {isGerman ? 'Speichern' : 'Save'}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={supplement.id.toString()} 
                className={`supplement-wipe border rounded-lg p-3 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/70 ${isCompleted ? 'completed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`supplement-${supplement.id}`}
                    checked={isCompleted}
                    onCheckedChange={() => onToggleSupplement(supplement.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`supplement-${supplement.id}`}
                      className="cursor-pointer text-sm font-medium leading-none block"
                    >
                      {supplement.name}
                    </label>
                    <div className="mt-1.5 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-accent">
                          {isGerman ? 'Dosierung:' : 'Dosage:'}
                        </span>{' '}
                        {supplement.dosage}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-accent">
                          {isGerman ? 'Uhrzeit:' : 'Time:'}
                        </span>{' '}
                        {supplement.time}
                      </p>
                      {supplement.note && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-accent">
                            {isGerman ? 'Notiz:' : 'Note:'}
                          </span>{' '}
                          {supplement.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClick(supplement)}
                      className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
                      title={isGerman ? 'Bearbeiten' : 'Edit'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(supplement.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
                      title={isGerman ? 'Löschen' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
