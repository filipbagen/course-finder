'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, MessageSquare, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  program: string | null;
  image: string | null;
  _count: {
    enrollment: number;
    review: number;
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
  const [users, setUsers] = useState<UserSearchResult[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(initialQuery || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery || '');
  const [programFilter, setProgramFilter] = useState(
    initialProgramFilter || 'all'
  );
  const [sortBy, setSortBy] = useState(initialSortBy || 'name');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileProgramFilter, setMobileProgramFilter] = useState(
    initialProgramFilter || 'all'
  );
  const [mobileSortBy, setMobileSortBy] = useState(initialSortBy || 'name');

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch users when search parameters change
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) {
          params.set('search', debouncedSearch.trim());
        }
        if (programFilter && programFilter !== 'all') {
          params.set('program', programFilter);
        }
        if (sortBy && sortBy !== 'name') {
          params.set('sortBy', sortBy);
        }
        params.set('limit', '50');

        const response = await fetch(`/api/users?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const result = await response.json();
        if (result.success) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Keep existing users on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch, programFilter, sortBy]);

  const handleProgramChange = (value: string) => {
    setProgramFilter(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleMobileProgramChange = (value: string) => {
    setMobileProgramFilter(value);
  };

  const handleMobileSortChange = (value: string) => {
    setMobileSortBy(value);
  };

  const applyMobileFilters = () => {
    setProgramFilter(mobileProgramFilter);
    setSortBy(mobileSortBy);
  };

  const resetMobileFilters = () => {
    setMobileProgramFilter('all');
    setMobileSortBy('name');
  };

  const syncMobileFilters = () => {
    setMobileProgramFilter(programFilter);
    setMobileSortBy(sortBy);
  };

  const activeMobileFilterCount =
    (mobileProgramFilter !== 'all' ? 1 : 0) + (mobileSortBy !== 'name' ? 1 : 0);

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
        <div className="p-6 rounded-lg border shadow-sm space-y-6 bg-card">
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
          {/* Search Input and Mobile Filter Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Sök efter studenter eller program..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  syncMobileFilters();
                  setMobileFiltersOpen(true);
                }}
                className="relative"
              >
                <Filter className="h-4 w-4" />
                {activeMobileFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeMobileFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* User Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map((user) => (
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
                    <p className="text-sm text-muted-foreground line-clamp-1 !mt-0">
                      {user.program || 'Inget program'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{user._count.enrollment}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{user._count.review}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {users.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Inga studenter hittades
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {debouncedSearch
                  ? `Inga resultat för "${debouncedSearch}". Prova ett annat sökord.`
                  : 'Det finns inga publika studentprofiler att visa just nu.'}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-4 text-sm text-muted-foreground">Söker...</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Dialog */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Filter studenter</DialogTitle>
            <DialogDescription>
              Välj filter för att begränsa studenterna som visas
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            <div className="space-y-4">
              <Label>Program</Label>
              <Select
                value={mobileProgramFilter}
                onValueChange={handleMobileProgramChange}
              >
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
              <Select
                value={mobileSortBy}
                onValueChange={handleMobileSortChange}
              >
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

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetMobileFilters();
                setMobileFiltersOpen(false);
              }}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              onClick={() => {
                applyMobileFilters();
                setMobileFiltersOpen(false);
              }}
              className="flex-1"
            >
              Tillämpa ({activeMobileFilterCount})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
