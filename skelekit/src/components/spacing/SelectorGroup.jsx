// src/components/spacing/SelectorGroup.jsx
import React from 'react';
import { Plus, X } from 'lucide-react'; 
import SelectorCard from './SelectorCard';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';

const SelectorGroup = ({ group, onUpdate, onRemove, spacingVariableOptions, propertyOptions }) => {

  const handleAddRule = () => {
    const newRule = { id: nanoid(), selector: '.new-selector', properties: [{ id: nanoid(), property: '', value: '' }] };
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
      className="relative mx-auto my-8 max-w-6xl px-4 sm:my-12"
    >
      <div className="overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white shadow-sm">
        <header className="border-b border-neutral-200/60 bg-white px-4 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={group.name}
              onChange={(e) => onUpdate({ ...group, name: e.target.value })}
              className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-1 text-lg font-semibold text-neutral-900 transition-colors focus:bg-neutral-50 focus:outline-none sm:text-xl"
              placeholder="Group name"
            />
            <button 
              onClick={onRemove}
              className="rounded-xl p-2 text-neutral-500 transition-all hover:bg-neutral-100 hover:text-red-500"
              aria-label="Remove selector group"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Column Headers */}
        <div className="hidden border-b border-neutral-200/60 bg-neutral-50/50 px-8 py-3.5 lg:block">
          <div className="grid grid-cols-[256px_1fr] gap-8 pr-4">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Selector</span>
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">CSS Property & Value</span>
          </div>
        </div>

        {/* Selectors List */}
        <div className="divide-y divide-neutral-200/60 overflow-visible">
          <AnimatePresence>
            {group.rules.map(rule => (
              <motion.div 
                key={rule.id} 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SelectorCard 
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

        {/* Add Button */}
        <div className="border-t border-neutral-200/60 bg-neutral-50/30 px-4 py-4 sm:px-8 sm:py-5">
          <button 
            onClick={handleAddRule}
            className="flex items-center gap-2 rounded-xl px-1 py-1 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <Plus size={16} /> Add Selector
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SelectorGroup;
