'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  TriStateCheckbox,
  CheckboxState,
} from '@/components/ui/TriStateCheckbox'
import { FilterState } from '@/types/types'

interface CheckboxItemProps {
  filterType: keyof FilterState
  value: string
  displayValue: string
  onChange: (newState: CheckboxState) => void
  state: CheckboxState
  isTriState: boolean
}

const CheckboxItem: React.FC<CheckboxItemProps> = React.memo(
  ({ displayValue, onChange, state, isTriState }) => {
    if (isTriState) {
      return (
        <label className="group flex cursor-pointer items-center gap-3">
          <TriStateCheckbox
            state={state}
            onStateChange={onChange}
            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          <span className="text-sm leading-none text-foreground transition-colors group-hover:text-primary">
            {displayValue}
          </span>
        </label>
      )
    }

    return (
      <label className="group flex cursor-pointer items-center gap-3">
        <Checkbox
          checked={state === 'checked'}
          onCheckedChange={(isChecked) =>
            onChange(isChecked ? 'checked' : 'unchecked')
          }
          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        />
        <span className="text-sm leading-none text-foreground transition-colors group-hover:text-primary">
          {displayValue}
        </span>
      </label>
    )
  },
)

CheckboxItem.displayName = 'CheckboxItem'
export default CheckboxItem
