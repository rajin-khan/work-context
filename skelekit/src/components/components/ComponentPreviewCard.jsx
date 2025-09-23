// src/components/components/ComponentPreviewCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ComponentPreview from './ComponentPreview';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// --- START OF THE FIX ---
// Destructure all the new data props
const ComponentPreviewCard = ({ 
  component, 
  onEdit,
  colorGroups,
  spacingGroups,
  typographyGroups,
  layoutVariableGroups,
  designVariableGroups,
}) => {
// --- END OF THE FIX ---
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
        <div style={{ transform: 'scale(0.8)' }}>
            {/* --- START OF THE FIX --- */}
            {/* Pass all the required data props to the ComponentPreview */}
            <ComponentPreview 
              component={component}
              colorGroups={colorGroups}
              spacingGroups={spacingGroups}
              typographyGroups={typographyGroups}
              layoutVariableGroups={layoutVariableGroups}
              designVariableGroups={designVariableGroups}
            />
            {/* --- END OF THE FIX --- */}
        </div>
      </div>
    </motion.div>
  );
};

export default ComponentPreviewCard;