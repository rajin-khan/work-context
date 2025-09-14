// src/components/spacing/SelectorGroup.jsx
import React from 'react';
import { Plus, X } from 'lucide-react'; 
import SelectorRow from './SelectorRow';
import { motion, AnimatePresence } from 'framer-motion';

const SelectorGroup = ({ group, onUpdate, onRemove, spacingVariableOptions, propertyOptions }) => {

  const handleAddRule = () => {
    const newRule = { id: Date.now(), selector: '', property: '', values: [''] };
    onUpdate({ ...group, rules: [...group.rules, newRule] });
  };
  
  const handleRemoveRule = (ruleId) => {
    onUpdate({ ...group, rules: group.rules.filter(r => r.id !== ruleId) });
  };

  const handleUpdateRule = (updatedRule) => {
    onUpdate({ ...group, rules: group.rules.map(r => r.id === updatedRule.id ? updatedRule : r) });
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
          aria-label="Remove selector group"
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
            {group.rules.map(rule => (
              <motion.div 
                key={rule.id} 
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SelectorRow 
                  rule={rule}
                  onUpdate={handleUpdateRule}
                  onRemove={() => handleRemoveRule(rule.id)}
                  spacingVariableOptions={spacingVariableOptions}
                  propertyOptions={propertyOptions}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <footer className="px-6 py-4 border-t border-neutral-800/50">
          <button 
            onClick={handleAddRule}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <Plus size={16} /> Add CSS Rule
          </button>
        </footer>
      </div>
    </motion.div>
  );
};

export default SelectorGroup;