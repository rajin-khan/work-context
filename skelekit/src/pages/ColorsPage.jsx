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
            <div className="bg-neutral-950 border border-neutral-900 p-8 rounded-lg max-w-md w-full text-center">
              <h2 className="text-lg font-semibold text-white mb-2">No color groups</h2>
              <p className="text-sm text-neutral-400 mb-6">Create a color group to get started.</p>
              <button onClick={onAddColorGroup} className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:bg-neutral-800 transition-colors">
                <Plus size={16} className="mr-2" />
                Create new color group
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onAddColorGroup}
            className="text-neutral-500 hover:text-white font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-800 hover:border-neutral-700"
          >
            <Plus size={16} /> Add Color Group
          </button>
        )}
      </div>
    </motion.main>
  );
};

export default ColorsPage;