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
  { value: 'theme-zinc', label: 'Zinc', emoji: '⚫' },
  { value: 'theme-slate', label: 'Slate', emoji: '⚫' },
  { value: 'theme-stone', label: 'Stone', emoji: '⚫' },
  { value: 'theme-gray', label: 'Gray', emoji: '⚫' },
  { value: 'theme-neutral', label: 'Neutral', emoji: '⚫' },
  { value: 'theme-blue', label: 'Blue', emoji: '🔵' },
  { value: 'theme-green', label: 'Green', emoji: '🟢' },
  { value: 'theme-violet', label: 'Violet', emoji: '🟣' },
  { value: 'theme-yellow', label: 'Yellow', emoji: '🟡' },
  { value: 'theme-orange', label: 'Orange', emoji: '🟠' },
  { value: 'theme-red', label: 'Red', emoji: '🔴' },
  { value: 'theme-rose', label: 'Rose', emoji: '🌹' },
];

export default function OnboardingForm({
  userId,
  userEmail,
  initialName = '',
}: OnboardingFormProps) {
  const [selectedColorScheme, setSelectedColorScheme] = useState('theme-blue');
  const [isPublic, setIsPublic] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  return (
    <form action={updateUserProfile} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      {/* Profile Picture */}
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <Card className="p-4">
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
              Upload a profile picture to help others recognize you (optional)
            </p>
          </div>
        </Card>
      </div>

      {/* Name - Hidden since it comes from signup */}
      <input type="hidden" name="name" value={initialName} />

      {/* Program */}
      <div className="space-y-2">
        <Label htmlFor="program">Program/Major *</Label>
        <Select name="program" required>
          <SelectTrigger>
            <SelectValue placeholder="Select your program" />
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
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Choose Your Theme
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {colorSchemes.map((scheme) => (
            <Card
              key={scheme.value}
              className={`cursor-pointer transition-all ${
                selectedColorScheme === scheme.value
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedColorScheme(scheme.value)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-2xl">{scheme.emoji}</span>
                  <span className="font-medium text-sm">{scheme.label}</span>
                </div>
                <input
                  type="radio"
                  name="colorScheme"
                  value={scheme.value}
                  checked={selectedColorScheme === scheme.value}
                  onChange={(e) => setSelectedColorScheme(e.target.value)}
                  className="sr-only"
                />
              </CardContent>
            </Card>
          ))}
        </div>
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
          Make my profile public (others can see my course reviews)
        </Label>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg">
        Complete Setup
      </Button>
    </form>
  );
}
