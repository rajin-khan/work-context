// src/pages/SelectorsPage.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import SelectorGroup from '../components/spacing/SelectorGroup';
import { spacingProperties, allCSSProperties } from '../utils/cssProperties'; // Use allCSSProperties for the dropdown
import FeatureHeader from '../components/ui/FeatureHeader';

const SelectorsPage = ({ selectorGroups, onAddSelectorGroup, onUpdateSelectorGroup, onRemoveSelectorGroup, scale, variableGroups }) => {
  
  // THIS IS THE CHANGE: Only spacing scale and spacing-specific variables are included.
  const spacingVariableOptions = useMemo(() => {
    const scaleOptions = scale.map(item => ({ label: `var(${item.name})`, value: `var(${item.name})` }));
    const customVarOptions = variableGroups.flatMap(group => 
      group.variables.map(variable => ({ label: `var(${variable.name})`, value: `var(${variable.name})` }))
    );
    return [...scaleOptions, ...customVarOptions];
  }, [scale, variableGroups]);

  // We still provide all CSS properties for the property input field itself.
  const propertyOptions = useMemo(() => allCSSProperties.map(prop => ({ label: prop, value: prop })), []);

  return (
    <motion.div 
        className="max-w-7xl mx-auto p-8 pb-16" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
    >
      <FeatureHeader
        title="Spacing Selectors"
        description="Create reusable CSS rules for any selector. This is perfect for styling components or creating complex layouts that utilize your generated spacing and custom variables."
      />

      <AnimatePresence>
        {selectorGroups.map(group => (
          <SelectorGroup 
            key={group.id} 
            group={group} 
            onUpdate={onUpdateSelectorGroup} 
            onRemove={() => onRemoveSelectorGroup(group.id)} 
            // Pass the now-scoped list of variables
            spacingVariableOptions={spacingVariableOptions} 
            propertyOptions={propertyOptions} 
          />
        ))}
      </AnimatePresence>
      <div className="max-w-5xl mx-auto my-12 px-4 flex items-center justify-center">
        <button onClick={onAddSelectorGroup} className="text-neutral-600 hover:text-neutral-900 font-medium text-sm py-2.5 px-5 rounded-lg transition-all flex items-center gap-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50">
          <Plus size={16} /> Create Selector Group
        </button>
      </div>
    </motion.div>
  );
};

export default SelectorsPage;