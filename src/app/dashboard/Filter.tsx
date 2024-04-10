// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import React from 'react';

const CheckboxItem = React.memo(
  ({
    filterType,
    value,
    displayValue,
  }: {
    filterType: string | number;
    value: string | number;
    displayValue: string;
  }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <Checkbox />
      <div className="leading-none text-base">{displayValue}</div>
    </label>
  )
);

// icons
import {
  SignpostBig,
  NotebookPen,
  School,
  Gauge,
  Blocks,
  BetweenHorizontalStart,
  AlignVerticalJustifyCenter,
  Network,
} from 'lucide-react';

export default function Filter() {
  interface AccordionItem {
    value: string;
    title: string;
    filterType: string;
    options: (string | number)[];
    displayValue: (value: string | number) => string;
    icon: JSX.Element;
  }

  const accordionItems: AccordionItem[] = [
    {
      value: 'semester',
      title: 'Termin',
      filterType: 'semester',
      options: [7, 8, 9],
      displayValue: (semester: string | number) => `Termin ${semester}`,
      icon: <BetweenHorizontalStart size={22} />,
    },
    {
      value: 'period',
      title: 'Period',
      filterType: 'period',
      options: [1, 2],
      displayValue: (period: string | number) => `Period ${period}`,
      icon: <AlignVerticalJustifyCenter size={22} />,
    },
    {
      value: 'block',
      title: 'Block',
      filterType: 'block',
      options: [1, 2, 3, 4],
      displayValue: (block: string | number) => `Block ${block}`,
      icon: <Blocks size={22} />,
    },
    {
      value: 'studyPace',
      title: 'Studietakt',
      filterType: 'studyPace',
      options: ['Helfart', 'Halvfart'],
      displayValue: (pace: string | number) => pace.toString(),
      icon: <Gauge size={22} />,
    },
    {
      value: 'level',
      title: 'Utbildningsnivå',
      filterType: 'courseLevel',
      options: ['Grundnivå', 'Avancerad nivå'],
      displayValue: (level: string | number) => level.toString(),
      icon: <Network size={22} />,
    },
    {
      value: 'fieldOfStudy',
      title: 'Huvudområde',
      filterType: 'mainFieldOfStudy',
      options: ['Medieteknik', 'Datateknik', 'Programvaruteknik', 'Övrigt'],
      displayValue: (field: string | number) => field.toString(),
      icon: <SignpostBig size={22} />,
    },
    {
      value: 'examination',
      title: 'Examination',
      filterType: 'examination',
      options: ['Tentamen', 'Laboration', 'Projekt', 'Övrigt'],
      displayValue: (type: string | number) => type.toString(),
      icon: <NotebookPen size={22} />,
    },
    {
      value: 'campus',
      title: 'Campus',
      filterType: 'location',
      options: ['Norrköping', 'Linköping'],
      displayValue: (campus: string | number) => campus.toString(),
      icon: <School size={22} />,
    },
  ];

  return (
    <Card
      className="sticky inset-x-0 top-20 overflow-y-auto h-full"
      style={{ maxHeight: 'calc(100vh - 74px)' }}
    >
      {/* Accordion */}
      <Accordion type="multiple" defaultValue={['semester']} className="w-full">
        {accordionItems.map((item) => (
          <AccordionItem value={item.value} key={item.value}>
            <AccordionTrigger>
              <CardHeader>
                <div className="flex gap-3 items-center">
                  {item.icon}
                  <CardTitle className="mb-0">{item.title}</CardTitle>
                </div>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="flex flex-col gap-4">
                {item.options.map((option: string | number) => {
                  const displayValue = item.displayValue(option);

                  return (
                    <CheckboxItem
                      key={String(option)}
                      filterType={item.filterType}
                      displayValue={displayValue}
                      value={option}
                    />
                  );
                })}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <CardFooter>
        <Button>Reset Filter</Button>
      </CardFooter>
    </Card>
  );
}
