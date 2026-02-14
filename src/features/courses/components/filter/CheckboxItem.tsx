'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  TriStateCheckbox,
  CheckboxState,
} from '@/components/ui/TriStateCheckbox';
import { FilterState } from '@/types/types';

interface CheckboxItemProps {
  filterType: keyof FilterState;
  value: string;
  displayValue: string;
  onChange: (newState: CheckboxState) => void;
  state: CheckboxState;
  isTriState: boolean;
}

const CheckboxItem: React.FC<CheckboxItemProps> = React.memo(
  ({ displayValue, onChange, state, isTriState }) => {
    if (isTriState) {
      return (
        <label className="flex items-center gap-3 cursor-pointer group">
          <TriStateCheckbox
            state={state}
            onStateChange={onChange}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="leading-none text-sm text-foreground group-hover:text-primary transition-colors">
            {displayValue}
          </span>
        </label>
      );
    }

    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <Checkbox
          checked={state === 'checked'}
          onCheckedChange={(isChecked) =>
            onChange(isChecked ? 'checked' : 'unchecked')
          }
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span className="leading-none text-sm text-foreground group-hover:text-primary transition-colors">
          {displayValue}
        </span>
      </label>
    );
  }
);

CheckboxItem.displayName = 'CheckboxItem';
export default CheckboxItem;
