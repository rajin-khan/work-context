// src/components/ui/Switch.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Switch = ({ enabled, setEnabled }) => {
  return (
    <div
      className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
        enabled ? 'bg-brand justify-end' : 'bg-neutral-700 justify-start'
      }`}
      onClick={() => setEnabled(!enabled)}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className="w-3.5 h-3.5 bg-white rounded-full shadow-md"
      />
    </div>
  );
};

export default Switch;