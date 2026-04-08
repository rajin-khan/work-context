
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
      className="group relative mx-auto my-8 max-w-5xl px-4"
    >
      <div className="overflow-hidden rounded-[24px] border border-neutral-300 bg-white shadow-xl">
        <button 
          onClick={onRemove}
          className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-neutral-500 transition-all hover:bg-neutral-100 hover:text-red-500 sm:top-5 sm:right-6 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Remove variable group"
        >
          <X size={18} />
        </button>

        <header className="flex items-center justify-between border-b border-neutral-200 p-4 sm:p-6">
          <input
            type="text"
            value={group.name}
            onChange={(e) => onUpdate({ ...group, name: e.target.value })}
            className="min-w-0 flex-1 rounded-xl bg-transparent px-2 text-xl font-bold tracking-tight text-neutral-800 focus:bg-neutral-100 focus:outline-none sm:text-2xl"
          />
        </header>

        <div className="space-y-3 p-4 sm:p-6">
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

        <footer className="border-t border-neutral-200/50 px-4 py-4 sm:px-6">
          <button 
            onClick={handleAddVariable}
            className="flex items-center gap-2 rounded-xl px-1 py-1 text-sm text-neutral-600 transition-colors hover:text-neutral-800"
          >
            <Plus size={16} /> Add Variable
          </button>
        </footer>
      </div>
    </motion.div>
  );
};

export default VariableGroup;
