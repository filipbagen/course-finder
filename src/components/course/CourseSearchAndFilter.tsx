'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const campuses = ['Linköping', 'Norrköping'];
const mainFieldsOfStudy = [
  'Datateknik',
  'Informationsteknologi',
  'Medieteknik',
  'Industriell ekonomi',
  'Matematik',
  'Tillämpad matematik',
  'Datavetenskap',
];
const semesters = ['7', '8', '9'];

export function CourseSearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [campus, setCampus] = useState(searchParams.get('campus') || '');
  const [mainFieldOfStudy, setMainFieldOfStudy] = useState(
    searchParams.get('field') || ''
  );
  const [semester, setSemester] = useState(searchParams.get('semester') || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (campus) params.set('campus', campus);
    if (mainFieldOfStudy) params.set('field', mainFieldOfStudy);
    if (semester) params.set('semester', semester);

    router.push(`/courses?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCampus('');
    setMainFieldOfStudy('');
    setSemester('');
    router.push('/courses');
  };

  const hasActiveFilters =
    searchQuery || campus || mainFieldOfStudy || semester;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Sök kurser efter namn eller kurskod..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={handleSearch}>Sök</Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Select value={campus} onValueChange={setCampus}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={mainFieldOfStudy}
                onValueChange={setMainFieldOfStudy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj huvudområde" />
                </SelectTrigger>
                <SelectContent>
                  {mainFieldsOfStudy.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj termin" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s} value={s}>
                      Termin {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-gray-600">Aktiva filter:</span>
              {searchQuery && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                  Sökning: "{searchQuery}"
                </div>
              )}
              {campus && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                  Campus: {campus}
                </div>
              )}
              {mainFieldOfStudy && (
                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
                  {mainFieldOfStudy}
                </div>
              )}
              {semester && (
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm">
                  Termin {semester}
                </div>
              )}
              <Button
                onClick={clearFilters}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseSearchAndFilter;
