
// src/components/spacing/VariableGroup.jsx
import React from 'react';
import { Plus, X } from 'lucide-react';
import VariableRow from './VariableRow';
import { motion, AnimatePresence } from 'framer-motion';

const VariableGroup = ({ group, onUpdate, onRemove }) => {

  const handleAddVariable = () => {
    const newVariable = { 
      id: Date.now(), 
      name: '--new-variable', 
      value: '', 
      mode: 'single', // Default to single value mode
      minValue: 0,
      maxValue: 0,
    };
    onUpdate({ ...group, variables: [...group.variables, newVariable] });
  };

  const handleRemoveVariable = (variableId) => {
    onUpdate({ ...group, variables: group.variables.filter(v => v.id !== variableId) });
  };

  const handleUpdateVariable = (updatedVariable) => {
    onUpdate({ ...group, variables: group.variables.map(v => v.id === updatedVariable.id ? updatedVariable : v) });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative max-w-5xl mx-auto my-8 px-4 group"
    >
      <div className="bg-black border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        <button 
          onClick={onRemove}
          className="absolute top-5 right-6 p-1.5 text-neutral-600 rounded-full hover:bg-neutral-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
          aria-label="Remove variable group"
        >
          <X size={18} />
        </button>

        <header className="flex items-center justify-between p-6 border-b border-neutral-800">
          <input
            type="text"
            value={group.name}
            onChange={(e) => onUpdate({ ...group, name: e.target.value })}
            className="text-2xl font-bold text-white tracking-tight bg-transparent focus:outline-none focus:bg-neutral-900 rounded px-2 -mx-2"
          />
        </header>

        <div className="p-6 space-y-3">
          <AnimatePresence>
            {group.variables.map(variable => (
              <motion.div
                key={variable.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <VariableRow 
                  variable={variable}
                  onUpdate={handleUpdateVariable}
                  onRemove={() => handleRemoveVariable(variable.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <footer className="px-6 py-4 border-t border-neutral-800/50">
          <button 
            onClick={handleAddVariable}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <Plus size={16} /> Add Variable
          </button>
        </footer>
      </div>
    </motion.div>
  );
};

export default VariableGroup;