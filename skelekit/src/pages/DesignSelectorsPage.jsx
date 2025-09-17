// src/pages/DesignSelectorsPage.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import SelectorGroup from '../components/spacing/SelectorGroup';
import { allCSSProperties } from '../utils/cssProperties';
import FeatureHeader from '../components/ui/FeatureHeader';

const DesignSelectorsPage = ({ 
  designSelectorGroups, 
  onAddDesignSelectorGroup, 
  onUpdateDesignSelectorGroup, 
  onRemoveDesignSelectorGroup, 
  scale, 
  designVariableGroups 
}) => {
  
  const designVariableOptions = useMemo(() => {
    // Foundational spacing scale is always available
    const scaleOptions = scale.map(item => ({ label: `var(${item.name})`, value: `var(${item.name})` }));
    
    // Only includes variables from the Design tab
    const customDesignVarOptions = designVariableGroups.flatMap(group =>
      group.variables.map(variable => ({ label: `var(${variable.name})`, value: `var(${variable.name})` }))
    );

    return [...scaleOptions, ...customDesignVarOptions];
  }, [scale, designVariableGroups]);

  const propertyOptions = useMemo(() => allCSSProperties.map(prop => ({ label: prop, value: prop })), []);

  return (
    <motion.div 
        className="max-w-5xl mx-auto p-8" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
    >
      <FeatureHeader
        title="Design Selectors"
        description="Define CSS rules for component styling, themes, and other visual elements. Use your color palette, spacing scale, and custom design variables."
      />

      <AnimatePresence>
        {designSelectorGroups.map(group => (
          <SelectorGroup 
            key={group.id} 
            group={group} 
            onUpdate={onUpdateDesignSelectorGroup} 
            onRemove={() => onRemoveDesignSelectorGroup(group.id)} 
            spacingVariableOptions={designVariableOptions} 
            propertyOptions={propertyOptions} 
          />
        ))}
      </AnimatePresence>
      <div className="max-w-5xl mx-auto my-8 px-4 flex items-center justify-center">
        <button 
            onClick={onAddDesignSelectorGroup} 
            className="text-neutral-500 hover:text-white font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-800 hover:border-neutral-700"
        >
          <Plus size={16} /> Create Design Selector Group
        </button>
      </div>
    </motion.div>
  );
};

export default DesignSelectorsPage;