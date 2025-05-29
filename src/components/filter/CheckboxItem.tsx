import { Checkbox } from '@/components/ui/checkbox';
import React from 'react';
import { FilterState } from '@/types/types';

interface CheckboxItemProps {
  filterType: keyof FilterState;
  value: string;
  displayValue: string;
  onChange: (checked: boolean) => void;
  checked: boolean;
}

const CheckboxItem: React.FC<CheckboxItemProps> = React.memo(
  ({ displayValue, onChange, checked }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={(isChecked) => onChange(isChecked === true)}
      />
      <span className="leading-none text-base">{displayValue}</span>
    </label>
  )
);

CheckboxItem.displayName = 'CheckboxItem';
export default CheckboxItem;
