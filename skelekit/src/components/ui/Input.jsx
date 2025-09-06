// src/components/ui/Input.jsx
import React from 'react';

const Input = ({ value, onChange, className = '', ...props }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className={`bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${className}`}
      {...props}
    />
  );
};

export default Input;