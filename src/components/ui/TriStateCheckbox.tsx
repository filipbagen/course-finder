'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate';

interface TriStateCheckboxProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    'onCheckedChange' | 'checked'
  > {
  state: CheckboxState;
  onStateChange?: (state: CheckboxState) => void;
}

const TriStateCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  TriStateCheckboxProps
>(({ className, state, onStateChange, ...props }, ref) => {
  const handleClick = () => {
    if (!onStateChange) return;

    switch (state) {
      case 'unchecked':
        onStateChange('checked');
        break;
      case 'checked':
        onStateChange('indeterminate');
        break;
      case 'indeterminate':
        onStateChange('unchecked');
        break;
    }
  };

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={state === 'checked' || state === 'indeterminate'}
      onCheckedChange={handleClick}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        {
          'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground':
            state === 'checked',
          'data-[state=checked]:bg-destructive data-[state=checked]:text-white':
            state === 'indeterminate',
        },
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        {state === 'checked' && <Check className="h-4 w-4" />}
        {state === 'indeterminate' && <Minus className="h-4 w-4 text-white" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

TriStateCheckbox.displayName = 'TriStateCheckbox';

export { TriStateCheckbox };
