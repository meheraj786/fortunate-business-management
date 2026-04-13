import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  success: 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)]',
  danger: 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)]',
  warning: 'bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning-hover)]',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  subtle: 'bg-transparent text-gray-700 hover:bg-gray-100',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-xs min-h-[32px]",
  md: "px-4 py-2 text-sm min-h-[40px]",
  lg: "px-5 py-2.5 text-base min-h-[48px]",
  full: "w-full px-4 py-2 text-sm min-h-[40px]",
};


const Button = React.forwardRef(
  (
    {
      children,
      className,
      onClick,
      variant = 'primary',
      size = 'md', // Default to md for better mobile experience
      isLoading = false,
      disabled = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const disabledState = isLoading || disabled;

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabledState}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] gap-2',
          buttonVariants[variant],
          buttonSizes[size],
          {
            'opacity-50 cursor-not-allowed': disabledState,
            'hover:scale-[1.02] active:scale-[0.98]': !disabledState,
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
