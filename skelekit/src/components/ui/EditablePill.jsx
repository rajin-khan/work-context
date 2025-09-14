// src/components/ui/EditablePill.jsx
import React, { useState, useEffect, useRef } from 'react';

const EditablePill = ({ value, onChange, placeholder, datalistId, options }) => {
  const [isEditing, setIsEditing] = useState(!value); // Start editing if the value is empty
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') inputRef.current?.blur();
    if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div
        className="font-mono text-sm py-1 px-3 cursor-pointer rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {value || <span className="text-neutral-500">{placeholder}</span>}
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        list={datalistId}
        placeholder={placeholder}
        className="font-mono text-sm bg-neutral-950 border border-neutral-700 text-white w-32 rounded-md px-3 py-1 outline-none focus:border-neutral-500"
      />
      <datalist id={datalistId}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} />
        ))}
      </datalist>
    </>
  );
};

export default EditablePill;