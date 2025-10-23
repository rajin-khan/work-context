// src/components/ui/Button.jsx
import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyles = 'px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white';
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-light focus:ring-brand',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-500',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800',
  };
  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;