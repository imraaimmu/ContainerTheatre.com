'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-terminal-green text-sm font-mono mb-2">
            {'>'} {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted font-mono">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full input-terminal rounded-md',
              prefix && 'pl-8',
              error && 'border-terminal-red focus:border-terminal-red',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-terminal-red text-sm font-mono">
            {'// error:'} {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
