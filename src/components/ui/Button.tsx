'use client';

import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const variants = {
    primary: 'bg-terminal-green text-terminal-black hover:bg-terminal-green/90 border-terminal-green',
    secondary: 'bg-terminal-blue text-terminal-black hover:bg-terminal-blue/90 border-terminal-blue',
    outline: 'bg-transparent text-terminal-green border-terminal-green hover:bg-terminal-green hover:text-terminal-black',
    ghost: 'bg-transparent text-terminal-green hover:bg-terminal-green/10 border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'relative font-mono font-medium border rounded transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover:scale-[1.02] active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
