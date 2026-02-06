import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Edit2, Trash2, Save, X } from 'lucide-react';
import { JournalEntry } from '../backend';
import { toast } from 'sonner';
import {
  useGetCallerUserProfile,
  useGetJournalEntries,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
} from '../hooks/useQueries';
import { Variant_de_en } from '../backend';

export default function JournalPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: journalEntries = [] } = useGetJournalEntries();
  const createJournalEntryMutation = useCreateJournalEntry();
  const updateJournalEntryMutation = useUpdateJournalEntry();
  const deleteJournalEntryMutation = useDeleteJournalEntry();

  const isGerman = userProfile?.preferences.language === Variant_de_en.de;

  const [newEntryContent, setNewEntryContent] = useState('');
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSealWithGratitude = async () => {
    if (!newEntryContent.trim()) {
      toast.error(
        isGerman 
          ? 'Bitte geben Sie einen Tagebucheintrag ein' 
          : 'Please enter a journal entry'
      );
      return;
    }

    setIsSaving(true);
    try {
      await createJournalEntryMutation.mutateAsync(newEntryContent);
      setNewEntryContent('');
      toast.success(
        isGerman 
          ? 'Tagebucheintrag mit Dankbarkeit versiegelt' 
          : 'Journal entry sealed with gratitude'
      );
    } catch (error) {
      toast.error(
        isGerman 
          ? 'Fehler beim Speichern des Eintrags' 
          : 'Error saving entry'
      );
      console.error('Error creating journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (entryId: bigint) => {
    if (!editContent.trim()) {
      toast.error(
        isGerman 
          ? 'Eintrag darf nicht leer sein' 
          : 'Entry cannot be empty'
      );
      return;
    }

    try {
      await updateJournalEntryMutation.mutateAsync({ entryId, content: editContent });
      setEditingId(null);
      setEditContent('');
      toast.success(
        isGerman 
          ? 'Eintrag aktualisiert' 
          : 'Entry updated'
      );
    } catch (error) {
      toast.error(
        isGerman 
          ? 'Fehler beim Aktualisieren' 
          : 'Error updating entry'
      );
      console.error('Error updating journal entry:', error);
    }
  };

  const handleDelete = async (entryId: bigint) => {
    if (!confirm(isGerman ? 'Eintrag wirklich löschen?' : 'Really delete entry?')) {
      return;
    }

    try {
      await deleteJournalEntryMutation.mutateAsync(entryId);
      toast.success(
        isGerman 
          ? 'Eintrag gelöscht' 
          : 'Entry deleted'
      );
    } catch (error) {
      toast.error(
        isGerman 
          ? 'Fehler beim Löschen' 
          : 'Error deleting entry'
      );
      console.error('Error deleting journal entry:', error);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString(isGerman ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedEntries = [...journalEntries].sort((a, b) => Number(b.timestamp - a.timestamp));

  // Determine time of day for adaptive theme
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'midday';
    return 'evening';
  };

  const timeOfDay = getTimeOfDay();

  return (
    <div className={`min-h-screen adaptive-gradient-${timeOfDay}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isGerman ? 'Tagebuch' : 'Journal'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Schreiben Sie Ihre Gedanken, Dankbarkeit und Reflexionen' 
              : 'Write your thoughts, gratitude, and reflections'}
          </p>
        </div>

        <Card className="glass-panel glass-panel-hover shadow-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img 
                src="/assets/generated/journal-icon-transparent.dim_64x64.png" 
                alt="Journal" 
                className="w-6 h-6 drop-shadow-md"
              />
              {isGerman ? 'Neuer Eintrag' : 'New Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New Entry Input */}
            <div className="space-y-3">
              <Textarea
                placeholder={
                  isGerman
                    ? 'Schreiben Sie Ihre Gedanken, Dankbarkeit oder Reflexionen...'
                    : 'Write your thoughts, gratitude, or reflections...'
                }
                value={newEntryContent}
                onChange={(e) => setNewEntryContent(e.target.value)}
                rows={6}
                className="resize-none backdrop-blur-sm"
              />
              <Button
                onClick={handleSealWithGratitude}
                disabled={isSaving || !newEntryContent.trim()}
                className="w-full shadow-glow-sm hover:shadow-glow transition-all duration-300"
              >
                <Heart className="w-4 h-4 mr-2" />
                {isSaving
                  ? (isGerman ? 'Speichern...' : 'Saving...')
                  : (isGerman ? 'Dankbarkeit versiegeln' : 'Seal with Gratitude')}
              </Button>
            </div>

            {/* Entries List with Scrollable Container */}
            {sortedEntries.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {isGerman ? 'Frühere Einträge' : 'Previous Entries'}
                </h3>
                <ScrollArea className="h-[500px] w-full rounded-md border border-border/50 p-4 backdrop-blur-sm">
                  <div className="space-y-3 pr-4">
                    {sortedEntries.map((entry) => (
                      <div
                        key={entry.id.toString()}
                        className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm space-y-2 transition-all duration-200 hover:bg-card/70"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.timestamp)}
                          </span>
                          {editingId !== entry.id && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(entry)}
                                className="h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive transition-all duration-200 hover:scale-110"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {editingId === entry.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={3}
                              className="resize-none"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(entry.id)}
                                className="flex-1 transition-all duration-200 hover:scale-105"
                              >
                                <Save className="w-3.5 h-3.5 mr-1" />
                                {isGerman ? 'Speichern' : 'Save'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="flex-1 transition-all duration-200 hover:scale-105"
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                {isGerman ? 'Abbrechen' : 'Cancel'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
