// src/components/ui/EditableProperty.jsx
import React, { useState, useEffect, useRef } from 'react';
import { spacingProperties } from '../../utils/cssProperties';

const EditableProperty = ({ value, onChange, startInEditMode = false, onEditComplete }) => {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
    if (onEditComplete) onEditComplete();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') inputRef.current?.blur();
    if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    // ** THE CHANGE: Placeholder text is simpler and the input area is better defined **
    return (
      <div
        className={`font-mono text-sm py-0.5 cursor-pointer rounded ${value ? 'text-white' : 'text-neutral-500 italic'}`}
        onClick={() => setIsEditing(true)}
      >
        {value || 'property...'}
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
        list="css-properties"
        // ** THE CHANGE: Styling is tweaked to be invisible within the pill **
        className="font-mono text-sm bg-transparent text-white w-28 outline-none"
      />
      <datalist id="css-properties">
        {spacingProperties.map(prop => (
          <option key={prop} value={prop} />
        ))}
      </datalist>
    </>
  );
};

export default EditableProperty;