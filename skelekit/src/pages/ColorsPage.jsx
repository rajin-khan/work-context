// src/pages/ColorsPage.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import ColorGroup from '../components/ColorGroup';

const ColorsPage = ({ colorGroups, onAddColorGroup, onUpdateColorGroup, onRemoveColorGroup }) => {
  return (
    <motion.main
      className="flex-1 p-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {colorGroups.map(group => (
          <motion.div 
            key={group.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mb-10"
          >
            <ColorGroup
              group={group}
              onUpdateGroup={onUpdateColorGroup}
              onRemoveGroup={onRemoveColorGroup}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex justify-center mt-8">
        {colorGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white border border-neutral-300 p-8 rounded-lg max-w-md w-full text-center">
              <h2 className="text-lg font-semibold text-neutral-800 mb-2">No color groups</h2>
              <p className="text-sm text-neutral-600 mb-6">Create a color group to get started.</p>
              <button onClick={onAddColorGroup} className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold bg-white border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors">
                <Plus size={16} className="mr-2" />
                Create new color group
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onAddColorGroup}
            className="text-neutral-600 hover:text-neutral-800 font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400"
          >
            <Plus size={16} /> Add Color Group
          </button>
        )}
      </div>
    </motion.main>
  );
};

export default ColorsPage;