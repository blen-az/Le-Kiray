import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 description?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
 ({ label, error, description, className = '', id, ...props }, ref) => {
 const inputId = id || props.name;

 return (
 <div className={`flex flex-col w-full ${className}`}>
 {label && (
 <label htmlFor={inputId} className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
 {label}
 </label>
 )}
 <input
 id={inputId}
 ref={ref}
 className={`w-full px-4 py-3.5 bg-white border rounded-2xl text-slate-900 placeholder-slate-400 outline-none text-sm transition-all ${
  error 
  ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/5' 
  : 'border-slate-200 focus:border-brand-main focus:ring-4 focus:ring-brand-main/5 shadow-sm'
  }`}
 {...props}
 />
 {description && !error && (
 <p className="mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">
 {description}
 </p>
 )}
 {error && (
 <p className="mt-2 text-xs text-red-500">
 {error}
 </p>
 )}
 </div>
 );
 }
);

Input.displayName = 'Input';
