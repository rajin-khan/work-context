// src/components/components/InitialComponentView.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const componentOptions = [{ id: 'button', name: 'Button' }];

const InitialComponentView = ({ onAddComponent }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleSelectComponent = (type) => {
    onAddComponent(type);
    setIsAdding(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-48 h-48 bg-neutral-950 border-2 border-dashed border-neutral-800 rounded-xl flex items-center justify-center text-neutral-600 hover:border-neutral-700 hover:text-neutral-500 transition-all duration-300"
        >
          <Plus size={48} />
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Select a Component</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-full text-neutral-500 hover:bg-neutral-800"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {componentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectComponent(opt.id)}
                className="w-full text-left px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-200"
              >
                {opt.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InitialComponentView;