import { Checkbox } from '@/components/ui/checkbox';
import React from 'react';

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

interface CheckboxItemProps {
  filterType: keyof FilterState;
  value: string;
  displayValue: string;
  onChange: (checked: boolean) => void;
  checked: boolean;
}

const CheckboxItem: React.FC<
  CheckboxItemProps & { onChange: (checked: boolean) => void; checked: boolean }
> = React.memo(({ displayValue, onChange, checked }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <Checkbox
      checked={checked}
      onCheckedChange={(isChecked) => onChange(isChecked === true)} // Assuming 'onChange' needs a boolean
    />
    <span className="leading-none text-base">{displayValue}</span>
  </label>
));

export default CheckboxItem;
