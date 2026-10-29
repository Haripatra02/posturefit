import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow active:bg-brand-800 focus-visible:ring-brand-600',
    secondary:
      'bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 hover:border-brand-300 focus-visible:ring-brand-500',
    outline:
      'bg-white hover:bg-surface-subtle text-charcoal-body border border-surface-border hover:border-charcoal-muted focus-visible:ring-brand-600',
    ghost:
      'bg-transparent hover:bg-surface-subtle text-charcoal-body hover:text-charcoal-heading focus-visible:ring-brand-600',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow focus-visible:ring-red-600',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
