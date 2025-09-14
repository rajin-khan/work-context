// src/pages/VariablesPage.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import VariableGroup from '../components/spacing/VariableGroup';

const VariablesPage = ({ 
  variableGroups, 
  onAddVariableGroup, 
  onUpdateVariableGroup, 
  onRemoveVariableGroup 
}) => (
  <motion.div 
    className="p-8" 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.3 }}
  >
    <AnimatePresence>
      {variableGroups.map(group => (
        <VariableGroup
          key={group.id}
          group={group}
          onUpdate={onUpdateVariableGroup}
          onRemove={() => onRemoveVariableGroup(group.id)}
        />
      ))}
    </AnimatePresence>
    
    <div className="max-w-5xl mx-auto my-8 px-4 flex items-center justify-center">
      <button
        onClick={onAddVariableGroup}
        className="text-neutral-500 hover:text-white font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-800 hover:border-neutral-700"
      >
        <Plus size={16} />
        Create Variable Group
      </button>
    </div>
  </motion.div>
);

export default VariablesPage;