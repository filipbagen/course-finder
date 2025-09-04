'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, BookOpen, MessageSquare, Filter, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

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
    <div className="flex gap-6">
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="p-6 rounded-lg border shadow-sm space-y-6">
          <h3 className="font-semibold text-lg">Filter</h3>
          <div className="space-y-4">
            <Label>Program</Label>
            <Select value={programFilter} onValueChange={handleProgramChange}>
              <SelectTrigger>
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
          <div className="space-y-4">
            <Label>Sortera efter</Label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger>
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

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="space-y-6">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Sök efter studenter eller program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>

          {/* User Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {initialUsers.map((user) => (
              <Card
                key={user.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-md"
                onClick={() => router.push(`/students/${user.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold line-clamp-1">{user.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {user.program || 'Inget program'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{user._count.enrollments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{user._count.reviews}</span>
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
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Inga studenter hittades
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {initialQuery
                  ? `Inga resultat för "${initialQuery}". Prova ett annat sökord.`
                  : 'Det finns inga publika studentprofiler att visa just nu.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
