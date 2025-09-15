// src/pages/SelectorsPage.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import SelectorGroup from '../components/spacing/SelectorGroup';
import { spacingProperties } from '../utils/cssProperties';
import FeatureHeader from '../components/ui/FeatureHeader';

const SelectorsPage = ({ selectorGroups, onAddSelectorGroup, onUpdateSelectorGroup, onRemoveSelectorGroup, scale, variableGroups }) => {
  const allVariableOptions = useMemo(() => {
    const scaleOptions = scale.map(item => ({ label: `var(${item.name})`, value: `var(${item.name})` }));
    const customVarOptions = variableGroups.flatMap(group => 
      group.variables.map(variable => ({ label: `var(${variable.name})`, value: `var(${variable.name})` }))
    );
    return [...scaleOptions, ...customVarOptions];
  }, [scale, variableGroups]);

  const propertyOptions = useMemo(() => spacingProperties.map(prop => ({ label: prop, value: prop })), []);

  return (
    <motion.div 
        className="max-w-5xl mx-auto p-8" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
    >
      <FeatureHeader
        title="Custom Selectors"
        description="Create reusable CSS rules for any selector. This is perfect for styling components or creating complex layouts that utilize your generated spacing and custom variables."
      />

      <AnimatePresence>
        {selectorGroups.map(group => (
          <SelectorGroup key={group.id} group={group} onUpdate={onUpdateSelectorGroup} onRemove={() => onRemoveSelectorGroup(group.id)} spacingVariableOptions={allVariableOptions} propertyOptions={propertyOptions} />
        ))}
      </AnimatePresence>
      <div className="max-w-5xl mx-auto my-8 px-4 flex items-center justify-center">
        <button onClick={onAddSelectorGroup} className="text-neutral-500 hover:text-white font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-800 hover:border-neutral-700">
          <Plus size={16} /> Create Selector Group
        </button>
      </div>
    </motion.div>
  );
};

export default SelectorsPage;