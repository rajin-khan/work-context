// src/components/spacing/SelectorCard.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import PropertyRow from './PropertyRow';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';

const SelectorCard = ({ rule, onUpdate, onRemove, spacingVariableOptions, propertyOptions }) => {
  // State now stores the class name *without* the leading dot.
  const [editableSelector, setEditableSelector] = useState(
    rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector
  );

  // Syncs parent prop changes to local state, stripping the dot.
  useEffect(() => {
    const newSelectorValue = rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector;
    if (newSelectorValue !== editableSelector) {
      setEditableSelector(newSelectorValue);
    }
  }, [rule.selector]);

  // Instantly sanitizes user input to allow only valid CSS class characters.
  const handleSelectorChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    setEditableSelector(sanitizedValue);
  };

  // On blur, formats the final selector with a dot and updates the parent state.
  const handleSelectorBlur = () => {
    const trimmedSelector = editableSelector.trim();
    if (!trimmedSelector) {
      // If the user clears the input, revert to the original value to avoid saving an empty selector.
      const originalValue = rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector;
      setEditableSelector(originalValue);
      return;
    }
    
    const finalSelector = `.${trimmedSelector}`;
    if (finalSelector !== rule.selector) {
      onUpdate({ ...rule, selector: finalSelector });
    }
  };

  const handleSelectorKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const handleAddProperty = () => {
    const newProperty = { id: nanoid(), property: '', value: '' };
    onUpdate({ ...rule, properties: [...rule.properties, newProperty] });
  };

  const handleUpdateProperty = (updatedProp) => {
    onUpdate({
      ...rule,
      properties: rule.properties.map(p => p.id === updatedProp.id ? updatedProp : p)
    });
  };

  const handleRemoveProperty = (propId) => {
    onUpdate({
      ...rule,
      properties: rule.properties.filter(p => p.id !== propId)
    });
  };

  return (
    <div className="bg-white/50 p-4 rounded-lg border border-neutral-300/50 hover:border-neutral-300 transition-colors group/card">
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* This wrapper provides the visual container for our input and its static dot prefix */}
        <div className="flex-1 flex items-center bg-transparent focus-within:bg-neutral-100 rounded transition-colors group/input">
          <span className="pl-2 text-neutral-500 font-mono text-lg group-focus-within/input:text-neutral-700">.</span>
          <input
            type="text"
            value={editableSelector}
            onChange={handleSelectorChange}
            onBlur={handleSelectorBlur}
            onKeyDown={handleSelectorKeyDown}
            placeholder="class-name"
            className="flex-1 bg-transparent focus:outline-none text-neutral-700 focus:text-neutral-800 transition-colors font-mono text-lg px-1 py-1"
          />
        </div>
        <button onClick={onRemove} className="text-neutral-500 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <X size={18} />
        </button>
      </div>
      
      <div className="pl-4 border-l-2 border-neutral-300">
        <div className="space-y-2">
          <AnimatePresence>
            {rule.properties.map(prop => (
              <motion.div
                key={prop.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
              >
                <PropertyRow
                  property={prop}
                  onUpdate={handleUpdateProperty}
                  onRemove={() => handleRemoveProperty(prop.id)}
                  spacingVariableOptions={spacingVariableOptions}
                  propertyOptions={propertyOptions}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <button
          onClick={handleAddProperty}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors mt-4"
        >
          <Plus size={14} /> Add Property
        </button>
      </div>
    </div>
  );
};

export default SelectorCard;