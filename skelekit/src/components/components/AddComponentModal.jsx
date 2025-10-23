// src/components/components/AddComponentModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// --- START OF THE FIX ---
const componentOptions = [
  { id: 'button', name: 'Button' },
  { id: 'input', name: 'Input Area' },
  { id: 'selector', name: 'HTML Selector' },
  { id: 'textarea', name: 'Textarea' },
  { id: 'checkbox', name: 'Checkbox' },
  { id: 'radio', name: 'Radio Button' },
];
// --- END OF THE FIX ---

const AddComponentModal = ({ isOpen, onClose, onAddComponent }) => {
  const handleSelectComponent = (type) => {
    onAddComponent(type);
    onClose(); // Close the modal after adding
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-sm bg-white border border-neutral-300 rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-neutral-800">Select a Component</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {componentOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectComponent(opt.id)}
                  className="w-full text-left px-4 py-2 rounded-md bg-white hover:bg-neutral-50 text-neutral-700"
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddComponentModal;