// src/components/spacing/VariableRow.jsx
import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ValueStepper from '../ui/ValueStepper';

const VariableRow = ({ variable, onUpdate, onRemove }) => {
  const [name, setName] = useState(variable.name.startsWith('--') ? variable.name.slice(2) : variable.name);
  
  const handleNameBlur = () => {
    const finalName = name.trim().startsWith('--') ? name.trim() : `--${name.trim()}`;
    if (finalName !== variable.name) {
      onUpdate({ ...variable, name: finalName });
    }
  };

  const handleValueChange = (key, value) => {
    onUpdate({ ...variable, [key]: value });
  };
  
  const toggleMode = () => {
    const newMode = variable.mode === 'single' ? 'minmax' : 'single';
    onUpdate({ ...variable, mode: newMode });
  };

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-transparent bg-neutral-100/50 p-3 hover:border-neutral-300 sm:flex-row sm:items-center sm:gap-4">
      <div className="group/input flex w-full items-center rounded-xl bg-transparent transition-colors focus-within:bg-neutral-200 sm:w-52">
        <span className="pl-2 text-neutral-500 group-focus-within/input:text-neutral-400">--</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          placeholder="variable-name"
          className="flex-1 bg-transparent focus:outline-none text-neutral-700 focus:text-neutral-800 transition-colors font-mono text-sm px-1 py-1"
        />
      </div>

      <div className="flex flex-1 items-center gap-3 sm:gap-4">
        <AnimatePresence mode="wait">
          {variable.mode === 'single' ? (
            <motion.input
              key="single"
              type="text"
              value={variable.value}
              onChange={(e) => handleValueChange('value', e.target.value)}
              placeholder="1rem, 100%, etc."
              className="w-full bg-transparent focus:outline-none text-neutral-700 focus:text-neutral-800 transition-colors font-mono text-sm px-2 py-1 rounded focus:bg-neutral-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            />
          ) : (
            <motion.div
              key="minmax"
              className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <ValueStepper
                value={variable.minValue || 0}
                onValueChange={(val) => handleValueChange('minValue', val)}
                unit="px"
              />
              <ValueStepper
                value={variable.maxValue || 0}
                onValueChange={(val) => handleValueChange('maxValue', val)}
                unit="px"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-end gap-1 sm:justify-start">
        <button
          onClick={toggleMode}
          className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
        >
          <ArrowRightLeft size={14} />
        </button>

        <button
          onClick={onRemove}
          className="rounded-xl p-2 text-neutral-500 transition-opacity hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default VariableRow;
