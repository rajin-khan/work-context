// src/pages/LayoutVariablesPage.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import VariableGroup from '../components/spacing/VariableGroup';
import FeatureHeader from '../components/ui/FeatureHeader';

const LayoutVariablesPage = ({ 
  layoutVariableGroups, 
  onAddLayoutVariableGroup, 
  onUpdateLayoutVariableGroup, 
  onRemoveLayoutVariableGroup 
}) => (
  <motion.div 
    className="max-w-5xl mx-auto p-8" 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.3 }}
  >
    <FeatureHeader
        title="Layout Variables"
        description="Define custom CSS variables specifically for your layout needs, such as container widths, gutter sizes, or z-index values."
      />
      
    <AnimatePresence>
      {layoutVariableGroups.map(group => (
        <VariableGroup
          key={group.id}
          group={group}
          onUpdate={onUpdateLayoutVariableGroup}
          onRemove={() => onRemoveLayoutVariableGroup(group.id)}
        />
      ))}
    </AnimatePresence>
    
    <div className="max-w-5xl mx-auto my-8 px-4 flex items-center justify-center">
      <button
        onClick={onAddLayoutVariableGroup}
        className="text-neutral-600 hover:text-neutral-800 font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400"
      >
        <Plus size={16} />
        Create Layout Variable Group
      </button>
    </div>
  </motion.div>
);

export default LayoutVariablesPage;