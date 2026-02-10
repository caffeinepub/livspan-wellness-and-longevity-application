import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, FileText } from 'lucide-react';
import { UserProfile } from '../backend';
import { isGerman, isMale, isFemale } from '../utils/backendVariants';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowDisclaimer: () => void;
}

export default function SettingsDialog({ open, onOpenChange, onShowDisclaimer }: SettingsDialogProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [bodyHeightCm, setBodyHeightCm] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [language, setLanguage] = useState<'en' | 'de'>('en');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setBirthYear(userProfile.birthYear.toString());
      setBodyHeightCm(userProfile.bodyHeightCm.toString());
      
      if (isMale(userProfile.gender)) {
        setGender('male');
      } else if (isFemale(userProfile.gender)) {
        setGender('female');
      } else {
        setGender('other');
      }
      
      setLanguage(isGerman(userProfile.preferences.language) ? 'de' : 'en');
    }
  }, [userProfile]);

  const handleSave = () => {
    if (!name.trim() || !birthYear || !bodyHeightCm) return;

    const year = parseInt(birthYear);
    const height = parseInt(bodyHeightCm);
    
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() || isNaN(height) || height <= 0) {
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      birthYear: BigInt(year),
      bodyHeightCm: BigInt(height),
      gender: gender as any,
      preferences: {
        language: language as any,
      },
    };

    saveProfile(profile, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleShowDisclaimer = () => {
    onOpenChange(false);
    setTimeout(() => {
      onShowDisclaimer();
    }, 100);
  };

  const isFormValid = name.trim() && birthYear && bodyHeightCm;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{language === 'de' ? 'Einstellungen' : 'Settings'}</DialogTitle>
          <DialogDescription>
            {language === 'de' ? 'Aktualisieren Sie Ihr Profil und Ihre Einstellungen' : 'Update your profile and preferences'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">{language === 'de' ? 'Name' : 'Name'}</Label>
            <Input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-birthYear">{language === 'de' ? 'Geburtsjahr' : 'Birth Year'}</Label>
            <Input
              id="settings-birthYear"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-bodyHeightCm">{language === 'de' ? 'Körpergröße (cm)' : 'Body Height (cm)'}</Label>
            <Input
              id="settings-bodyHeightCm"
              type="number"
              value={bodyHeightCm}
              onChange={(e) => setBodyHeightCm(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-gender">{language === 'de' ? 'Geschlecht' : 'Gender'}</Label>
            <select
              id="settings-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="male">{language === 'de' ? 'Männlich' : 'Male'}</option>
              <option value="female">{language === 'de' ? 'Weiblich' : 'Female'}</option>
              <option value="other">{language === 'de' ? 'Andere' : 'Other'}</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-language">{language === 'de' ? 'Sprache' : 'Language'}</Label>
            <select
              id="settings-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'de')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <Button onClick={handleSave} disabled={isPending || !isFormValid} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'de' ? 'Wird gespeichert...' : 'Saving...'}
              </>
            ) : (
              language === 'de' ? 'Änderungen speichern' : 'Save Changes'
            )}
          </Button>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {language === 'de' ? 'Rechtliche Informationen' : 'Legal Information'}
            </Label>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleShowDisclaimer}
            >
              <FileText className="mr-2 h-4 w-4" />
              Legal Disclaimer / Rechtlicher Hinweis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
