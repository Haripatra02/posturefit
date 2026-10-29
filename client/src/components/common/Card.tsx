import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-surface-card rounded-2xl border border-surface-border shadow-card p-5 sm:p-6 transition-all duration-200 ${
        hoverable ? 'hover:shadow-card-hover hover:border-brand-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
