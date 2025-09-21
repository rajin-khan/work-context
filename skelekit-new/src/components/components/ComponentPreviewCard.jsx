// src/components/components/ComponentPreviewCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ComponentPreview from './ComponentPreview'; // Import the live preview component

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const ComponentPreviewCard = ({ component, onEdit }) => {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden flex flex-col group"
      whileHover={{ scale: 1.03, y: -5, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
    >
      <div className="px-4 py-2 border-b border-neutral-800 flex justify-between items-center">
        <span className="font-mono text-sm text-neutral-400">
          .{component.name}
        </span>
        <button
          onClick={onEdit}
          className="px-3 py-1 text-xs font-semibold bg-neutral-800 rounded-md hover:bg-neutral-700 text-neutral-200"
        >
          Edit
        </button>
      </div>
      
      <div className="h-48 flex-1 flex items-center justify-center bg-white p-4 overflow-hidden">
        {/*
          This wrapper scales down the preview to fit nicely in the card.
          The ComponentPreview inside will render the button with all its live styles.
        */}
        <div style={{ transform: 'scale(0.8)' }}>
            <ComponentPreview component={component} />
        </div>
      </div>
    </motion.div>
  );
};

export default ComponentPreviewCard;