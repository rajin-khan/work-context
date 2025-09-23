// src/components/ui/EditablePill.jsx
import React, { useState, useEffect, useRef } from 'react';

const EditablePill = ({ value, onChange, placeholder, datalistId, options, inputClassName = 'w-32' }) => {
  const [isEditing, setIsEditing] = useState(!value);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  // ** THIS IS THE FIX **
  // This effect ensures that if the parent's `value` prop changes
  // (e.g., when switching from viewing .btn to :hover),
  // the pill's internal state (`currentValue`) is updated to match.
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

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
      setCurrentValue(value); // Revert to original prop value on escape
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div
        className="font-mono text-sm py-1 px-3 cursor-pointer rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition-colors w-full text-left"
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
        className={`font-mono text-sm bg-neutral-950 border border-neutral-700 text-white rounded-md px-3 py-1 outline-none focus:border-neutral-500 ${inputClassName}`}
      />
      <datalist id={datalistId}>
        {(options || []).map(opt => (
          <option key={opt.value} value={opt.value} />
        ))}
      </datalist>
    </>
  );
};

export default EditablePill;