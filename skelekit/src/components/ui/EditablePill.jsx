// src/components/ui/EditablePill.jsx
import React, { useState, useEffect, useRef } from 'react';

const EditablePill = ({ value, onChange, placeholder, datalistId, options, inputClassName = 'w-32', textColor = 'text-neutral-800' }) => {
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
        className={`font-mono text-sm py-0.5 px-1.5 cursor-pointer ${textColor} hover:bg-neutral-100/60 rounded transition-colors w-full text-left truncate`}
        onClick={() => setIsEditing(true)}
      >
        {value || <span className="text-neutral-400 italic">{placeholder}</span>}
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
        className={`font-mono text-sm bg-white border border-neutral-300 text-neutral-800 rounded px-3 py-1.5 w-full outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 ${inputClassName}`}
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