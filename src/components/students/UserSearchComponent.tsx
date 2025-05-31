'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, BookOpen, MessageSquare, Filter, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  program: string | null;
  image: string | null;
  _count: {
    enrollments: number;
    reviews: number;
  };
}

interface UserSearchComponentProps {
  initialUsers: UserSearchResult[];
  initialQuery?: string;
  availablePrograms: string[];
  initialProgramFilter?: string;
  initialSortBy?: string;
}

export function UserSearchComponent({
  initialUsers,
  initialQuery,
  availablePrograms,
  initialProgramFilter,
  initialSortBy,
}: UserSearchComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [programFilter, setProgramFilter] = useState(
    initialProgramFilter || 'all'
  );
  const [sortBy, setSortBy] = useState(initialSortBy || 'name');

  const handleFiltersChange = (
    query?: string,
    program?: string,
    sort?: string
  ) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      // Handle search query
      const finalQuery = query ?? searchQuery;
      if (finalQuery) {
        params.set('search', finalQuery);
      } else {
        params.delete('search');
      }

      // Handle program filter
      const finalProgram = program ?? programFilter;
      if (finalProgram && finalProgram !== 'all') {
        params.set('program', finalProgram);
      } else {
        params.delete('program');
      }

      // Handle sort
      const finalSort = sort ?? sortBy;
      if (finalSort && finalSort !== 'name') {
        params.set('sort', finalSort);
      } else {
        params.delete('sort');
      }

      router.push(`/students?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFiltersChange(searchQuery);
  };

  const handleProgramChange = (value: string) => {
    setProgramFilter(value);
    handleFiltersChange(undefined, value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    handleFiltersChange(undefined, undefined, value);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Bar with Button Design */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-2xl items-center gap-2 mx-auto"
        >
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Sök efter studenter eller program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-white/70 backdrop-blur-sm shadow-lg"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            variant="outline"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
          >
            {isPending ? 'Söker...' : 'Sök'}
          </Button>
        </form>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Program Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Program:</span>
            <Select value={programFilter} onValueChange={handleProgramChange}>
              <SelectTrigger className="w-48 rounded-xl border-2 border-gray-200 bg-white/70 backdrop-blur-sm">
                <SelectValue placeholder="Välj program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla program</SelectItem>
                {availablePrograms.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Option */}
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sortera:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48 rounded-xl border-2 border-gray-200 bg-white/70 backdrop-blur-sm">
                <SelectValue placeholder="Sortera efter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Namn (A-Z)</SelectItem>
                <SelectItem value="reviews">Flest recensioner</SelectItem>
                <SelectItem value="enrollments">Flest kurser</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">
            {initialUsers.length === 0
              ? 'Inga studenter hittades'
              : `${initialUsers.length} student${
                  initialUsers.length !== 1 ? 'er' : ''
                } hittad${initialUsers.length !== 1 ? 'e' : ''}`}
          </span>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialUsers.map((user) => (
            <Card
              key={user.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/70 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 rounded-2xl overflow-hidden"
              onClick={() => router.push(`/students/${user.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* User Info */}
                  <div className="space-y-2 w-full">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                      {user.name}
                    </h3>

                    <Badge className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                      {user.program || 'Inget program'}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between w-full pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">
                        {user._count.enrollments}
                      </span>
                      <span className="text-xs">kurser</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">{user._count.reviews}</span>
                      <span className="text-xs">recensioner</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {initialUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Inga studenter hittades
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              {initialQuery
                ? `Inga resultat för "${initialQuery}". Prova ett annat sökord.`
                : 'Det finns inga publika studentprofiler att visa just nu.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
