// src/components/spacing/SelectorRow.jsx
import React, { useState, useEffect } from 'react'; // Import React hooks
import { X, Plus } from 'lucide-react';
import EditablePill from '../ui/EditablePill';

const SelectorRow = ({ rule, onUpdate, onRemove, spacingVariableOptions, propertyOptions }) => {
  // ** NEW: Local state to manage the raw value of the selector input (without the '.') **
  const [editableSelector, setEditableSelector] = useState(
    rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector
  );

  // This effect keeps the local input value in sync if the parent data ever changes.
  useEffect(() => {
    const newSelectorValue = rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector;
    if (newSelectorValue !== editableSelector) {
        setEditableSelector(newSelectorValue);
    }
  }, [rule.selector]);

  const handleAddValue = () => {
    onUpdate({ ...rule, values: [...rule.values, ''] });
  };
  
  const handleUpdateValue = (indexToUpdate, newValue) => {
    const newValues = rule.values.map((v, i) => (i === indexToUpdate ? newValue : v));
    onUpdate({ ...rule, values: newValues });
  };

  const handleRemoveValue = (indexToRemove) => {
    const newValues = rule.values.filter((_, i) => i !== indexToRemove);
    onUpdate({ ...rule, values: newValues });
  };
  
  // ** NEW: Handler for typing directly in the selector input **
  const handleSelectorChange = (e) => {
    // We only update the local state while typing for a smooth experience.
    setEditableSelector(e.target.value);
  };
  
  // ** NEW: Handler to format and commit the final selector value when the user is done **
  const handleSelectorBlur = () => {
    const trimmedSelector = editableSelector.trim();
    // Enforce the '.' prefix on the final value.
    const finalSelector = trimmedSelector.startsWith('.') ? trimmedSelector : `.${trimmedSelector}`;
    
    // Only call the update function if the value has actually changed.
    if (finalSelector !== rule.selector) {
      onUpdate({ ...rule, selector: finalSelector });
    }
  };
  
  // ** NEW: A helper to commit changes when the user presses Enter **
  const handleSelectorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger the blur event to validate and save.
    }
  };

  return (
    <div className="flex items-center gap-3 group bg-neutral-900/50 p-2 rounded-lg border border-transparent hover:border-neutral-800">
      
      {/* ** THE CHANGE: The input is now visually composed with a static '.' prefix ** */}
      <div className="flex items-center w-48 bg-transparent focus-within:bg-neutral-800 rounded transition-colors group/input">
        <span className="pl-2 text-neutral-600 group-focus-within/input:text-neutral-400">.</span>
        <input
          type="text"
          value={editableSelector}
          onChange={handleSelectorChange}
          onBlur={handleSelectorBlur}
          onKeyDown={handleSelectorKeyDown}
          placeholder="class-name"
          className="flex-1 bg-transparent focus:outline-none text-neutral-300 focus:text-white transition-colors font-mono text-sm px-1 py-1"
        />
      </div>

      <span className="text-neutral-700">{'{'}</span>
      
      <EditablePill
        value={rule.property}
        onChange={(prop) => onUpdate({ ...rule, property: prop })}
        placeholder="property"
        datalistId="css-properties"
        options={propertyOptions}
      />

      <span className="text-neutral-700">:</span>
      
      <div className="flex items-center gap-2 flex-wrap">
        {rule.values.map((val, index) => (
          <div key={index} className="flex items-center gap-1 group/pill">
            <EditablePill
              value={val}
              onChange={(newVal) => handleUpdateValue(index, newVal)}
              placeholder="value"
              datalistId="spacing-variables"
              options={spacingVariableOptions}
            />
            <button onClick={() => handleRemoveValue(index)} className="text-neutral-700 hover:text-red-500 opacity-0 group-hover/pill:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
        <button onClick={handleAddValue} className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-neutral-500 rounded-full hover:bg-neutral-700 hover:text-white transition-all">
          <Plus size={14} />
        </button>
      </div>
      
      <span className="text-neutral-700 ml-auto">{'}'}</span>
      
      <button onClick={onRemove} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export default SelectorRow;