'use client';

import { useState } from 'react';
import { updateUserProfile } from './actions';
import Avatar from '@/components/shared/avatar';
import { programs } from '@/lib/programs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Eye, EyeOff } from 'lucide-react';

interface OnboardingFormProps {
  userId: string;
  userEmail: string;
  initialName?: string;
}

const colorSchemes = [
  { value: 'theme-blue', label: 'Blå' },
  { value: 'theme-green', label: 'Grön' },
  { value: 'theme-violet', label: 'Violett' },
  { value: 'theme-yellow', label: 'Gul' },
  { value: 'theme-orange', label: 'Orange' },
  { value: 'theme-red', label: 'Röd' },
  { value: 'theme-rose', label: 'Rosa' },
];

export default function OnboardingForm({
  userId,
  userEmail,
  initialName = '',
}: OnboardingFormProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  return (
    <form action={updateUserProfile} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      {/* Profile Picture */}
      <div className="space-y-2">
        <Label>Profilbild</Label>
        <Card className="p-4 border-border bg-card text-card-foreground">
          <div className="flex flex-col items-center space-y-4">
            <Avatar
              uid={userId}
              url={avatarUrl}
              size={120}
              onUpload={(url) => {
                setAvatarUrl(url);
              }}
            />
            <p className="text-sm text-muted-foreground text-center">
              Ladda upp en profilbild så andra kan känna igen dig (valfritt)
            </p>
          </div>
        </Card>
      </div>

      {/* Name - Hidden since it comes from signup */}
      <input type="hidden" name="name" value={initialName} />

      {/* Program */}
      <div className="space-y-2">
        <Label htmlFor="program">Program/Utbildning *</Label>
        <Select name="program" required>
          <SelectTrigger>
            <SelectValue placeholder="Välj ditt program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program} value={program}>
                {program}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color Scheme */}
      <div className="space-y-2">
        <Label htmlFor="colorScheme" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Välj ditt tema
        </Label>
        <Select name="colorScheme" defaultValue="theme-blue">
          <SelectTrigger>
            <SelectValue placeholder="Välj ett tema" />
          </SelectTrigger>
          <SelectContent>
            {colorSchemes.map((scheme) => (
              <SelectItem key={scheme.value} value={scheme.value}>
                {scheme.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Privacy Setting */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPublic"
          name="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => setIsPublic(checked as boolean)}
        />
        <Label htmlFor="isPublic" className="flex items-center gap-2">
          {isPublic ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          Gör min profil offentlig (andra kan se mina kursrecensioner och
          schema)
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        size="lg"
      >
        Slutför konfiguration
      </Button>
    </form>
  );
}
