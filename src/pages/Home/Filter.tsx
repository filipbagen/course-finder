// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface SelectedFilters {
  period: number[];
  semester: number[];
  // Add other filter types as needed, for example:
  // block: string[];
}

interface FilterProps {
  handleFilterChange: (
    filterType: keyof SelectedFilters,
    value: number | string
  ) => (checked: boolean) => void;
}

const Filter: React.FC<FilterProps> = ({ handleFilterChange }) => (
  <Card className="sticky max-h-max inset-x-0 top-16 overflow-scroll">
    {/* Semester */}
    <CardHeader>
      <CardTitle>Termin</CardTitle>
      <CardDescription>Deploy your new project in one-click.</CardDescription>
    </CardHeader>

    <CardContent className="flex flex-col gap-4">
      <div className="items-top flex space-x-2">
        <Checkbox onCheckedChange={handleFilterChange('semester', 7)} />
        <div className="grid gap-1.5 leading-none">Termin 7</div>
      </div>

      <div className="items-top flex space-x-2">
        <Checkbox onCheckedChange={handleFilterChange('semester', 8)} />
        <div className="grid gap-1.5 leading-none">Termin 8</div>
      </div>

      <div className="items-top flex space-x-2">
        <Checkbox onCheckedChange={handleFilterChange('semester', 9)} />
        <div className="grid gap-1.5 leading-none">Termin 9</div>
      </div>
    </CardContent>

    {/* Period */}
    <CardHeader>
      <CardTitle>Period</CardTitle>
      <CardDescription>Deploy your new project in one-click.</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <div className="items-top flex space-x-2">
        <Checkbox onCheckedChange={handleFilterChange('period', 1)} />
        <div className="grid gap-1.5 leading-none">Period 1</div>
      </div>

      <div className="items-top flex space-x-2">
        <Checkbox onCheckedChange={handleFilterChange('period', 2)} />
        <div className="grid gap-1.5 leading-none">Period 2</div>
      </div>
    </CardContent>
  </Card>
);

export default Filter;
