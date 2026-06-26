import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';
 size?: 'sm' | 'md' | 'lg';
 isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
 children,
 variant = 'primary',
 size = 'md',
 isLoading = false,
 className = '',
 disabled,
 ...props
}) => {
  const baseStyles = 'font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 duration-200 btn-ripple';
  
  const variants = {
    primary: 'bg-brand-main hover:bg-brand-main/90 text-white shadow-md shadow-brand-main/10 hover:shadow-lg hover:shadow-brand-main/20',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    warning: 'bg-brand-accent hover:bg-brand-accent/90 text-white shadow-md shadow-brand-accent/10 hover:shadow-lg hover:shadow-brand-accent/20',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-7 py-4 text-base',
  };

 return (
 <button
 className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
 disabled={disabled || isLoading}
 {...props}
 >
 {isLoading && (
 <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
 )}
 {children}
 </button>
 );
};
