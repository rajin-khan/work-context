// src/pages/LayoutSelectorsPage.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import SelectorGroup from '../components/spacing/SelectorGroup';
import { allCSSProperties } from '../utils/cssProperties'; 
import FeatureHeader from '../components/ui/FeatureHeader';

const LayoutSelectorsPage = ({ 
  layoutSelectorGroups, 
  onAddLayoutSelectorGroup, 
  onUpdateLayoutSelectorGroup, 
  onRemoveLayoutSelectorGroup, 
  scale, 
  layoutVariableGroups 
}) => {
  
  // THIS IS THE CHANGE: Only spacing scale and layout-specific variables are included.
  const layoutVariableOptions = useMemo(() => {
    // It can still see the foundational spacing scale
    const scaleOptions = scale.map(item => ({ label: `var(${item.name})`, value: `var(${item.name})` }));
    
    // But it only gets variables from its own section
    const customLayoutVarOptions = layoutVariableGroups.flatMap(group =>
      group.variables.map(variable => ({ label: `var(${variable.name})`, value: `var(${variable.name})` }))
    );

    return [...scaleOptions, ...customLayoutVarOptions];
  }, [scale, layoutVariableGroups]);

  const propertyOptions = useMemo(() => allCSSProperties.map(prop => ({ label: prop, value: prop })), []);

  return (
    <motion.div 
        className="max-w-5xl mx-auto p-8" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
    >
      <FeatureHeader
        title="Layout Selectors"
        description="Define CSS rules for layout-specific components and structures. Use your spacing scale and custom variables to build consistent, reusable blocks."
      />

      <AnimatePresence>
        {layoutSelectorGroups.map(group => (
          <SelectorGroup 
            key={group.id} 
            group={group} 
            onUpdate={onUpdateLayoutSelectorGroup} 
            onRemove={() => onRemoveLayoutSelectorGroup(group.id)} 
            // Pass the now-scoped list of variables
            spacingVariableOptions={layoutVariableOptions} 
            propertyOptions={propertyOptions} 
          />
        ))}
      </AnimatePresence>
      <div className="max-w-5xl mx-auto my-8 px-4 flex items-center justify-center">
        <button 
            onClick={onAddLayoutSelectorGroup} 
            className="text-neutral-600 hover:text-neutral-800 font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400"
        >
          <Plus size={16} /> Create Layout Selector Group
        </button>
      </div>
    </motion.div>
  );
};

export default LayoutSelectorsPage;