import React, { forwardRef } from 'react';
import { cn } from '../../../lib/utils';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };