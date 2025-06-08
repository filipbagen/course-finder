'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
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
    <label className="flex items-center gap-3 cursor-pointer group">
      <Checkbox
        checked={checked}
        onCheckedChange={(isChecked) => onChange(isChecked === true)}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <span className="leading-none text-sm text-foreground group-hover:text-primary transition-colors">
        {displayValue}
      </span>
    </label>
  )
);

CheckboxItem.displayName = 'CheckboxItem';
export default CheckboxItem;
