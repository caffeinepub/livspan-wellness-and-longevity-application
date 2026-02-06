import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Variant_de_en, Gender } from '../backend';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [birthYear, setBirthYear] = useState('');
  const [bodyHeightCm, setBodyHeightCm] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthYear || !bodyHeightCm) return;

    const year = parseInt(birthYear);
    const height = parseInt(bodyHeightCm);
    
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() || isNaN(height) || height <= 0) {
      return;
    }

    let genderEnum: Gender;
    if (gender === 'male') {
      genderEnum = Gender.male;
    } else if (gender === 'female') {
      genderEnum = Gender.female;
    } else {
      genderEnum = Gender.other;
    }

    saveProfile({
      name: name.trim(),
      birthYear: BigInt(year),
      bodyHeightCm: BigInt(height),
      gender: genderEnum,
      preferences: {
        language: language === 'en' ? Variant_de_en.en : Variant_de_en.de,
      },
    });
  };

  const isFormValid = name.trim() && birthYear && bodyHeightCm;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/assets/generated/livspan-logo-transparent.dim_200x200.png" alt="LivSpan" className="mx-auto mb-4 h-20 w-20" />
          <CardTitle className="text-2xl">Welcome to LivSpan</CardTitle>
          <CardDescription>Let's set up your profile to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{language === 'de' ? 'Ihr Name' : 'Your Name'}</Label>
              <Input
                id="name"
                type="text"
                placeholder={language === 'de' ? 'Geben Sie Ihren Namen ein' : 'Enter your name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthYear">{language === 'de' ? 'Geburtsjahr' : 'Birth Year'}</Label>
              <Input
                id="birthYear"
                type="number"
                placeholder={language === 'de' ? 'z.B. 1990' : 'e.g. 1990'}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyHeightCm">{language === 'de' ? 'Körpergröße (cm)' : 'Body Height (cm)'}</Label>
              <Input
                id="bodyHeightCm"
                type="number"
                placeholder={language === 'de' ? 'z.B. 175' : 'e.g. 175'}
                value={bodyHeightCm}
                onChange={(e) => setBodyHeightCm(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">{language === 'de' ? 'Geschlecht' : 'Gender'}</Label>
              <select
                id="gender"
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
              <Label htmlFor="language">{language === 'de' ? 'Bevorzugte Sprache' : 'Preferred Language'}</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'de')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={isPending || !isFormValid}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'de' ? 'Profil wird erstellt...' : 'Creating Profile...'}
                </>
              ) : (
                language === 'de' ? 'Weiter' : 'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
