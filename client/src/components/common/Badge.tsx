import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'success' | 'amber' | 'blue' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const variantStyles = {
    default: 'bg-surface-subtle text-charcoal-muted border border-surface-border',
    brand: 'bg-brand-50 text-brand-800 border border-brand-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    blue: 'bg-blue-50 text-blue-800 border border-blue-200',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
