// src/components/ui/UtilityClassGenerator.jsx
import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const utilityTypes = [
  { id: 'text', label: 'Text' },
  { id: 'background', label: 'Background' },
  { id: 'border', label: 'Border' },
  { id: 'fill', label: 'Fill' },
];

const UtilityClassGenerator = ({ config, onConfigChange }) => {

  const handleToggle = (utilId) => {
    onConfigChange({ ...config, [utilId]: !config[utilId] });
  };

  return (
    <div className="bg-neutral-950 p-4 border-t border-neutral-900">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-neutral-200">Generate utility classes</h4>
        <div className="flex items-center gap-2">
          {utilityTypes.map((util) => {
            const isEnabled = config[util.id];
            return (
              <button
                key={util.id}
                onClick={() => handleToggle(util.id)}
                className={`relative px-4 py-1.5 text-sm rounded-full transition-all duration-200 ease-in-out
                  ${
                    isEnabled
                      ? 'bg-brand/20 text-brand-light border border-brand'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-500'
                  }
                `}
              >
                <div className="flex items-center gap-1.5">
                    {isEnabled && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={14} />
                        </motion.div>
                    )}
                    <span>{util.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UtilityClassGenerator;