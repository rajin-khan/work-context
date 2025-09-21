// src/components/components/ComponentCSSDisplay.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import ComponentPropertyRow from './ComponentPropertyRow';
import { motion, AnimatePresence } from 'framer-motion';

const ComponentCSSDisplay = ({ styles, onUpdateStyles, activeModifier }) => {
  const handleAddProperty = () => {
    onUpdateStyles({ ...styles, '': '' }); // Add a new empty property
  };

  const handleUpdateProperty = (oldProp, newProp, newValue) => {
    if (oldProp === newProp) {
        onUpdateStyles({ ...styles, [newProp]: newValue });
        return;
    }
    const newStyles = { ...styles };
    delete newStyles[oldProp];
    newStyles[newProp] = newValue;
    onUpdateStyles(newStyles);
  };

  const handleRemoveProperty = (propToRemove) => {
    const newStyles = { ...styles };
    delete newStyles[propToRemove];
    onUpdateStyles(newStyles);
  };

  const selectorName = activeModifier || '';
  const descriptionText = selectorName.includes(':')
    ? `Pseudo-class styles for ${selectorName}`
    : `Base styles for ${selectorName}`

  return (
    <div className="w-[450px] bg-black border-l border-neutral-800 flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
            key={selectorName}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="p-4 border-b border-neutral-800"
        >
            <h3 className="font-semibold text-white">CSS for {selectorName}</h3>
            <p className="text-xs text-neutral-400 mt-1">{descriptionText}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        <AnimatePresence>
        {Object.entries(styles).map(([prop, value]) => (
          <motion.div
            key={prop}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <ComponentPropertyRow
              property={prop}
              value={value}
              onUpdate={(newProp, newValue) => handleUpdateProperty(prop, newProp, newValue)}
              onRemove={() => handleRemoveProperty(prop)}
            />
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={handleAddProperty}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
        >
          <Plus size={16} /> Add Property
        </button>
      </div>
    </div>
  );
};

export default ComponentCSSDisplay;