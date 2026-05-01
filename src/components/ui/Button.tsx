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
 const baseStyles = 'font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
 
 const variants = {
 primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20',
 secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
 danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500',
 warning: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30',
 ghost: 'hover:bg-slate-800 text-slate-400 hover:text-white',
 };

 const sizes = {
 sm: 'px-4 py-2 text-xs',
 md: 'px-6 py-3 text-sm',
 lg: 'px-8 py-4 text-base',
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
