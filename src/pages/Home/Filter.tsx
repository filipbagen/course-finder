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

const Filter = () => {
  return (
    <>
      <Card className="sticky max-h-max inset-x-0 top-16 overflow-scroll">
        {/* Semester */}
        <CardHeader>
          <CardTitle>Termin</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="items-top flex space-x-2">
            <Checkbox />
            <div className="grid gap-1.5 leading-none">Termin 7</div>
          </div>

          <div className="items-top flex space-x-2">
            <Checkbox />
            <div className="grid gap-1.5 leading-none">Termin 8</div>
          </div>

          <div className="items-top flex space-x-2">
            <Checkbox />
            <div className="grid gap-1.5 leading-none">Termin 8</div>
          </div>
        </CardContent>

        {/* Period */}
        <CardHeader>
          <CardTitle>Period</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="items-top flex space-x-2">
            <Checkbox />
            <div className="grid gap-1.5 leading-none">Period 1</div>
          </div>

          <div className="items-top flex space-x-2">
            <Checkbox />
            <div className="grid gap-1.5 leading-none">Period 2</div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Filter;
