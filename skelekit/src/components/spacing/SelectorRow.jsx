// src/components/spacing/SelectorRow.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import EditablePill from '../ui/EditablePill';

const SelectorRow = ({ rule, onUpdate, onRemove, spacingVariableOptions, propertyOptions }) => {
  const [editableSelector, setEditableSelector] = useState(
    rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector
  );

  useEffect(() => {
    const newSelectorValue = rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector;
    if (newSelectorValue !== editableSelector) {
        setEditableSelector(newSelectorValue);
    }
  }, [rule.selector]);

  const handleValueChange = (newValue) => {
    onUpdate({ ...rule, value: newValue });
  };
  
  const handleSelectorChange = (e) => {
    setEditableSelector(e.target.value);
  };
  
  const handleSelectorBlur = () => {
    const trimmedSelector = editableSelector.trim();
    const finalSelector = trimmedSelector.startsWith('.') ? trimmedSelector : `.${trimmedSelector}`;
    
    if (finalSelector !== rule.selector) {
      onUpdate({ ...rule, selector: finalSelector });
    }
  };
  
  const handleSelectorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); 
    }
  };

  return (
    <div className="flex items-center gap-3 group bg-neutral-900/50 p-2 rounded-lg border border-transparent hover:border-neutral-800">
      
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
      
      {/* ** THE FIX: Wrapper div with a defined width for the property ** */}
      <div className="w-40">
        <EditablePill
          value={rule.property}
          onChange={(prop) => onUpdate({ ...rule, property: prop })}
          placeholder="property"
          datalistId="css-properties"
          options={propertyOptions}
          inputClassName="w-full"
        />
      </div>

      <span className="text-neutral-700">:</span>
      
      {/* ** THE FIX: Wrapper div with a defined, slightly larger width for the value ** */}
      <div className="w-48">
        <EditablePill
          value={rule.value}
          onChange={handleValueChange}
          placeholder="value"
          datalistId="spacing-variables"
          options={spacingVariableOptions}
          inputClassName="w-full"
        />
      </div>
      
      {/* This spacer div will now take up all the extra space */}
      <div className="flex-1"></div>

      <span className="text-neutral-700">{'}'}</span>
      
      <button onClick={onRemove} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export default SelectorRow;