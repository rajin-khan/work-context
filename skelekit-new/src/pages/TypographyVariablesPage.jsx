// src/pages/TypographyVariablesPage.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import VariableGroup from '../components/spacing/VariableGroup';
import FeatureHeader from '../components/ui/FeatureHeader';

const TypographyVariablesPage = ({ 
  typographyVariableGroups, 
  onAddTypographyVariableGroup, 
  onUpdateTypographyVariableGroup, 
  onRemoveTypographyVariableGroup 
}) => (
  <motion.div 
    className="max-w-5xl mx-auto p-8" 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.3 }}
  >
    <FeatureHeader
        title="Typography Variables"
        description="Define custom CSS variables for typographic properties like font-weights, line-heights, or letter-spacing values."
      />
      
    <AnimatePresence>
      {typographyVariableGroups.map(group => (
        <VariableGroup
          key={group.id}
          group={group}
          onUpdate={onUpdateTypographyVariableGroup}
          onRemove={() => onRemoveTypographyVariableGroup(group.id)}
        />
      ))}
    </AnimatePresence>
    
    <div className="max-w-5xl mx-auto my-8 px-4 flex items-center justify-center">
      <button
        onClick={onAddTypographyVariableGroup}
        className="text-neutral-500 hover:text-white font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-800 hover:border-neutral-700"
      >
        <Plus size={16} />
        Create Typography Variable Group
      </button>
    </div>
  </motion.div>
);

export default TypographyVariablesPage;