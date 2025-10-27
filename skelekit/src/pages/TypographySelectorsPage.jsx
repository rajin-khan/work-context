// src/pages/TypographySelectorsPage.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import SelectorGroup from '../components/spacing/SelectorGroup';
import { allCSSProperties } from '../utils/cssProperties';
import FeatureHeader from '../components/ui/FeatureHeader';

const TypographySelectorsPage = ({ 
  typographySelectorGroups, 
  onAddTypographySelectorGroup, 
  onUpdateTypographySelectorGroup, 
  onRemoveTypographySelectorGroup, 
  typographyScale, 
  typographyVariableGroups 
}) => {
  
  const typographyVariableOptions = useMemo(() => {
    const scaleOptions = typographyScale.map(item => ({ label: `var(${item.name})`, value: `var(${item.name})` }));
    
    const customTypographyVarOptions = typographyVariableGroups.flatMap(group =>
      group.variables.map(variable => ({ label: `var(${variable.name})`, value: `var(${variable.name})` }))
    );

    return [...scaleOptions, ...customTypographyVarOptions];
  }, [typographyScale, typographyVariableGroups]);

  const propertyOptions = useMemo(() => allCSSProperties.map(prop => ({ label: prop, value: prop })), []);

  return (
    <motion.div 
        className="max-w-7xl mx-auto p-8 pb-16" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
    >
      <FeatureHeader
        title="Typography Selectors"
        description="Define CSS rules for typographic elements like headings, paragraphs, or blockquotes. Use your type scale and custom typography variables for consistent styling."
      />

      <AnimatePresence>
        {typographySelectorGroups.map(group => (
          <SelectorGroup 
            key={group.id} 
            group={group} 
            onUpdate={onUpdateTypographySelectorGroup} 
            onRemove={() => onRemoveTypographySelectorGroup(group.id)} 
            spacingVariableOptions={typographyVariableOptions} 
            propertyOptions={propertyOptions} 
          />
        ))}
      </AnimatePresence>
      <div className="max-w-5xl mx-auto my-12 px-4 flex items-center justify-center">
        <button 
            onClick={onAddTypographySelectorGroup} 
            className="text-neutral-600 hover:text-neutral-900 font-medium text-sm py-2.5 px-5 rounded-lg transition-all flex items-center gap-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
        >
          <Plus size={16} /> Create Typography Selector Group
        </button>
      </div>
    </motion.div>
  );
};

export default TypographySelectorsPage;