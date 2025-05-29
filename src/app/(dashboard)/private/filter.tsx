import React from 'react';
import {
  Card,
  CardContent,
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

import CheckboxItem from '../../../components/filter/CheckboxItem';
import { accordionItems } from '../../../components/filter/accordionItemsConfig';
import { FilterState, FilterProps } from '../../../types/types';

const Filter: React.FC<FilterProps> = ({
  screen,
  onFilterChange,
  currentFilters,
}) => {
  const resetFilters = () => {
    Object.keys(currentFilters).forEach((filterType) => {
      currentFilters[filterType as keyof FilterState].forEach((value) => {
        onFilterChange(filterType as keyof FilterState, String(value), false);
      });
    });
  };

  return (
    <Card
      className={`${
        screen === 'desktop'
          ? 'sticky inset-x-0 top-20 overflow-y-auto h-fit max-h-[calc(100vh - 74px)]'
          : ''
      }`}
      style={screen === 'desktop' ? { maxHeight: 'calc(100vh - 100px)' } : {}}
    >
      <Accordion type="multiple" defaultValue={['semester']} className="w-full">
        {accordionItems.map((item) => {
          const isAnyOptionChecked =
            currentFilters[item.filterType as keyof FilterState].length > 0;

          return (
            <AccordionItemComponent value={item.value} key={item.value}>
              <AccordionTrigger>
                <CardHeader>
                  <div className="flex gap-4 items-center">
                    {item.icon && <item.icon size={20} />}
                    <CardTitle className="mb-0 text-base font-medium">
                      {item.title}
                    </CardTitle>
                    {isAnyOptionChecked && (
                      <span className="ml-4 h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="flex flex-col gap-4">
                  {item.options.map((option) => {
                    const optionString = option.toString();
                    const displayValue = item.displayValue(optionString);
                    const isChecked =
                      currentFilters[
                        item.filterType as keyof FilterState
                      ].includes(optionString);

                    return (
                      <CheckboxItem
                        key={optionString}
                        filterType={item.filterType as keyof FilterState}
                        displayValue={displayValue}
                        value={optionString}
                        onChange={(checked) =>
                          onFilterChange(
                            item.filterType as keyof FilterState,
                            optionString,
                            checked
                          )
                        }
                        checked={isChecked}
                      />
                    );
                  })}
                </CardContent>
              </AccordionContent>
            </AccordionItemComponent>
          );
        })}
      </Accordion>
      <CardFooter>
        <Button onClick={resetFilters}>Ta bort filter</Button>
      </CardFooter>
    </Card>
  );
};

export default Filter;
