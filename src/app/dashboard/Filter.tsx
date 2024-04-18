// react
import React, { useState } from 'react';

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
  AccordionItem as AccordionItemComponent,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { AccordionItemProps } from '../components/filter/types';
import CheckboxItem from '../components/filter/CheckboxItem';
import { accordionItems } from '../components/filter/accordionItemsConfig';

interface FilterState {
  semester: string[];
  period: string[];
  block: string[];
  studyPace: string[];
  courseLevel: string[];
  mainFieldOfStudy: string[];
  examinations: string[];
  location: string[];
}

interface FilterProps {
  onFilterChange: (
    filterType: keyof FilterState,
    value: string,
    isChecked: boolean
  ) => void;
  currentFilters: FilterState;
}

const Filter: React.FC<FilterProps> = ({ onFilterChange, currentFilters }) => {
  const [filters, setFilters] = useState<Record<string, any[]>>({});

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <Card
      className="sticky inset-x-0 top-20 overflow-y-auto h-full"
      style={{ maxHeight: 'calc(100vh - 74px)' }}
    >
      <Accordion type="multiple" defaultValue={['semester']} className="w-full">
        {accordionItems.map((item) => (
          <AccordionItemComponent value={item.value} key={item.value}>
            <AccordionTrigger>
              <CardHeader>
                <div className="flex gap-4 items-center">
                  <item.icon size={20} />
                  <CardTitle className="mb-0 text-base font-medium">
                    {item.title}
                  </CardTitle>
                </div>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="flex flex-col gap-4">
                {item.options.map((option) => {
                  // Convert option to string since FilterState expects string values
                  const optionString = option.toString();
                  // Retrieve display value for the current option
                  const displayValue = item.displayValue(optionString);
                  // Check if the current option is selected
                  const isChecked =
                    currentFilters[item.filterType].includes(optionString);

                  // console.log(currentFilters[item.filterType]);

                  return (
                    <CheckboxItem
                      key={optionString}
                      filterType={item.filterType}
                      displayValue={displayValue}
                      value={optionString}
                      onChange={(checked) =>
                        onFilterChange(item.filterType, optionString, checked)
                      }
                      checked={isChecked}
                    />
                  );
                })}
              </CardContent>
            </AccordionContent>
          </AccordionItemComponent>
        ))}
      </Accordion>
      <CardFooter>
        <Button onClick={resetFilters}>Reset Filter</Button>
      </CardFooter>
    </Card>
  );
};

export default Filter;
