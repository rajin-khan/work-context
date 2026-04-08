// src/components/spacing/SelectorCard.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Copy } from 'lucide-react';
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

  const handleCopySelector = () => {
    navigator.clipboard.writeText(rule.selector);
  };

  return (
    <div className="border-t border-neutral-200/60 px-4 py-4 first:border-t-0 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-8">
        {/* Left Section: Selector Name */}
        <div className="flex w-full min-w-0 items-center gap-3 xl:w-64 xl:flex-none">
          <GripVertical size={16} className="text-neutral-400/60 cursor-grab" />
          <div className="group/input flex flex-1 items-center rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-2.5 transition-all focus-within:border-neutral-300 focus-within:bg-white focus-within:shadow-sm">
            <span className="text-neutral-500 font-mono text-sm">.</span>
            <input
              type="text"
              value={editableSelector}
              onChange={handleSelectorChange}
              onBlur={handleSelectorBlur}
              onKeyDown={handleSelectorKeyDown}
              placeholder="selector-name"
              className="flex-1 bg-transparent focus:outline-none text-neutral-900 font-mono text-sm ml-1 placeholder:text-neutral-400"
            />
          </div>
          <button 
            onClick={handleCopySelector} 
            className="rounded-xl border border-neutral-200 p-2 text-neutral-400 transition-all hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-700"
            title="Copy selector"
          >
            <Copy size={14} />
          </button>
        </div>

        {/* Right Section: Property Panel */}
        <div className="relative min-w-0 flex-1 overflow-visible rounded-[22px] border border-neutral-200 bg-neutral-50/30 p-4 sm:p-5 sm:pr-6">
          <button 
            onClick={onRemove} 
            className="absolute -top-2.5 -right-2.5 w-7 h-7 flex items-center justify-center bg-white border border-neutral-200 rounded-full hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm z-10"
            title="Remove selector"
          >
            <X size={14} />
          </button>
          
          <div className="space-y-1">
            <AnimatePresence>
              {rule.properties.map((prop, index) => (
                <motion.div
                  key={prop.id}
                  layout
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className={index > 0 ? "border-t border-neutral-200/60 pt-3 mt-3" : ""}
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
            className="group mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 transition-all hover:border-neutral-400 hover:bg-white"
            title="Add property"
          >
            <Plus size={16} className="text-neutral-500 group-hover:text-neutral-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectorCard;
