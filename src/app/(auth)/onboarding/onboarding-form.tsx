'use client';

import { useState } from 'react';
import { updateUserProfile } from './actions';
import Avatar from '@/components/shared/avatar';

interface OnboardingFormProps {
  userId: string;
  userEmail: string;
}

const colorSchemes = [
  { value: 'theme-blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'theme-green', label: 'Green', color: 'bg-green-500' },
  { value: 'theme-purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'theme-orange', label: 'Orange', color: 'bg-orange-500' },
];

const programs = [
  'Computer Science',
  'Engineering',
  'Business',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Psychology',
  'Other',
];

export default function OnboardingForm({
  userId,
  userEmail,
}: OnboardingFormProps) {
  const [selectedColorScheme, setSelectedColorScheme] = useState('theme-blue');
  const [isPublic, setIsPublic] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  return (
    <form action={updateUserProfile} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      {/* Profile Picture */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Profile Picture
        </label>
        <Avatar
          uid={userId}
          url={avatarUrl}
          size={120}
          onUpload={(url) => {
            setAvatarUrl(url);
          }}
        />
        <p className="mt-2 text-sm text-gray-500">
          Upload a profile picture to help others recognize you (optional)
        </p>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name *
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your full name"
          />
        </div>
      </div>

      {/* Program */}
      <div>
        <label
          htmlFor="program"
          className="block text-sm font-medium text-gray-700"
        >
          Program/Major *
        </label>
        <div className="mt-1">
          <select
            name="program"
            id="program"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select your program</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Your Theme
        </label>
        <div className="grid grid-cols-2 gap-3">
          {colorSchemes.map((scheme) => (
            <label
              key={scheme.value}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                selectedColorScheme === scheme.value
                  ? 'border-indigo-600 ring-2 ring-indigo-600'
                  : 'border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="colorScheme"
                value={scheme.value}
                checked={selectedColorScheme === scheme.value}
                onChange={(e) => setSelectedColorScheme(e.target.value)}
                className="sr-only"
              />
              <span className="flex flex-1">
                <span className="flex flex-col">
                  <span className="flex items-center">
                    <span
                      className={`w-4 h-4 rounded-full ${scheme.color} mr-2`}
                    ></span>
                    <span className="block text-sm font-medium text-gray-900">
                      {scheme.label}
                    </span>
                  </span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Setting */}
      <div>
        <div className="flex items-center">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isPublic"
            className="ml-2 block text-sm text-gray-900"
          >
            Make my profile public (others can see my course reviews)
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Complete Setup
        </button>
      </div>
    </form>
  );
}
