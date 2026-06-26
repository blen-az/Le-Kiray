import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
 label?: string;
 error?: string;
 description?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ label, error, description, className = '', id, ...props }, ref) => {
 const textareaId = id || props.name;

 return (
 <div className={`flex flex-col w-full ${className}`}>
 {label && (
 <label htmlFor={textareaId} className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
 {label}
 </label>
 )}
 <textarea
 id={textareaId}
 ref={ref}
 className={`w-full px-4 py-3.5 bg-white border rounded-2xl text-slate-900 placeholder-slate-400 outline-none resize-none text-sm transition-all ${
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

Textarea.displayName = 'Textarea';
