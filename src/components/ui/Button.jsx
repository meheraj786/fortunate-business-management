import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  success: 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)]',
  danger: 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)]',
  warning: 'bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning-hover)]',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  subtle: 'bg-transparent text-gray-700 hover:bg-gray-100',
};

const buttonSizes = {
  // Small button
  sm: "px-4 py-2 text-sm sm:px-3 sm:py-1.5 sm:text-xs",

  // Medium button (default)
  md: "px-6 py-3 text-base sm:px-4 sm:py-2 sm:text-sm",

  // Large button
  lg: "px-8 py-4 text-lg sm:px-5 sm:py-2.5 sm:text-base",

  // Full width button
  full: "w-full px-6 py-3 text-base sm:text-sm",
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
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabledState}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] gap-2', // increased border-radius
          'min-h-[48px] sm:min-h-[44px]', // Ensure minimum touch target height, detailed for mobile
          buttonVariants[variant],
          buttonSizes[size],
          {
            'opacity-50 cursor-not-allowed': disabledState,
          },
          className
        )}
        whileHover={!disabledState ? { scale: 1.02 } : {}}
        whileTap={!disabledState ? { scale: 0.98 } : {}}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
