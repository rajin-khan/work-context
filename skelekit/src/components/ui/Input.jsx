// src/components/ui/Input.jsx
import React from 'react';

const Input = ({ value, onChange, className = '', ...props }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className={`bg-white border border-neutral-300 rounded-md px-3 py-1.5 text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${className}`}
      {...props}
    />
  );
};

export default Input;