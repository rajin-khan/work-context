// src/components/components/ComponentCSSDisplay.jsx
import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import ComponentPropertyRow from './ComponentPropertyRow';
import { motion, AnimatePresence } from 'framer-motion';
import { allCSSProperties, spacingProperties, typographyProperties, colorProperties } from '../../utils/cssProperties';
import { nanoid } from 'nanoid';

const ComponentCSSDisplay = ({ 
    styles, 
    onUpdateStyles, 
    activeModifier,
    allColorVariables,
    allSpacingVariables,
    allTypographyVariables,
    allGlobalVariables
}) => {
  
  const propertyOptions = useMemo(() => allCSSProperties.map(p => ({ label: p, value: p })), []);

  const getValueOptionsForProperty = (property) => {
    const prop = property.toLowerCase().trim();
    if (!prop) return allGlobalVariables;
    if (colorProperties.includes(prop)) return allColorVariables;
    if (spacingProperties.includes(prop)) return allSpacingVariables;
    if (typographyProperties.includes(prop)) return allTypographyVariables;
    return allGlobalVariables;
  };

  // --- START OF THE FIX: REWRITE HANDLERS FOR ARRAY DATA STRUCTURE ---
  const handleAddProperty = () => {
    const newStyles = [...styles, { id: nanoid(), prop: '', value: '' }];
    onUpdateStyles(newStyles);
  };

  const handleUpdateProperty = (updatedItem) => {
    const newStyles = styles.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    onUpdateStyles(newStyles);
  };

  const handleRemoveProperty = (idToRemove) => {
    const newStyles = styles.filter(item => item.id !== idToRemove);
    onUpdateStyles(newStyles);
  };
  // --- END OF THE FIX ---

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
        {/* THE FIX IS HERE: Map over the array and use the stable item.id as the key */}
        {styles.map(item => (
          <motion.div
            key={item.id} 
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <ComponentPropertyRow
              item={item} // Pass the whole item object
              onUpdate={handleUpdateProperty}
              onRemove={() => handleRemoveProperty(item.id)}
              propertyOptions={propertyOptions}
              valueOptions={getValueOptionsForProperty(item.prop)}
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