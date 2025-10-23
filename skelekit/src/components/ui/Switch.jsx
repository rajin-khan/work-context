// src/components/ui/Switch.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Switch = ({ enabled, setEnabled }) => {
  return (
    <div
      onClick={() => setEnabled(!enabled)}
      // ** THIS IS THE CHANGE: Added border classes for a much clearer outline **
      // The switch now has a 2px border that changes color with the state.
      className={`relative w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ease-in-out border-2 ${
        enabled 
          ? 'bg-brand justify-end border-brand-light/50' // Active state: brand bg with a lighter, glowing border
          : 'bg-neutral-200 justify-start border-neutral-300' // Inactive state: neutral bg and border
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className="w-3 h-3 bg-neutral-700 rounded-full shadow-md"
      />
    </div>
  );
};

export default Switch;