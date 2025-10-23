// src/components/ShadeTintGenerator.jsx
import React from 'react';
import Switch from './ui/Switch';
import EditableSwatch from './ui/EditableSwatch';
import ColorPickerPopover from './ColorPickerPopover';
// ** THIS IS THE CHANGE: Import Sun and Moon icons **
import { Plus, Minus, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShadeTintGenerator = ({ type, config, onConfigChange, format }) => {
  const { enabled, count, palette } = config;
  const { editingState, setEditingState } = config;

  const displayName = type === 'shades' ? 'Dark Palette' : 'Light Palette';
  // ** THIS IS THE CHANGE: Select the icon based on the type **
  const Icon = type === 'shades' ? Moon : Sun;

  const handleCountChange = (amount) => {
    const newCount = Math.max(3, Math.min(10, count + amount));
    onConfigChange({ count: newCount, enabled: true });
  };

  const handleEnableToggle = () => {
    onConfigChange({ enabled: !enabled });
  };

  const handleEdit = (e, color, index) => {
    e.stopPropagation();
    setEditingState({ isOpen: true, anchorEl: e.currentTarget, color, index, format, type });
  };

  return (
    <div className="bg-white p-4 border-t border-neutral-200 first:border-t-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* ** THIS IS THE CHANGE: Added the icon before the heading ** */}
          <Icon size={16} className="text-neutral-500" />
          <h4 className="text-sm font-medium text-neutral-700">Generate {displayName}</h4>
        </div>
        <Switch enabled={enabled} setEnabled={handleEnableToggle} />
      </div>
      
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-lg px-1">
                <button onClick={() => handleCountChange(-1)} className="p-1.5 text-neutral-600 hover:text-neutral-800 transition-colors rounded-md hover:bg-neutral-100"><Minus size={14} /></button>
                <span className="text-sm font-medium text-neutral-700 w-24 text-center">{count} {type}</span>
                <button onClick={() => handleCountChange(1)} className="p-1.5 text-neutral-600 hover:text-neutral-800 transition-colors rounded-md hover:bg-neutral-100"><Plus size={14} /></button>
              </div>
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
              <AnimatePresence>
                {palette.map((color, index) => (
                  <EditableSwatch 
                    key={`${type}-${index}-${color}`}
                    color={editingState.isOpen && editingState.index === index && editingState.type === type ? editingState.color : color}
                    onEdit={(e) => handleEdit(e, color, index)}
                    onCopy={(hex) => navigator.clipboard.writeText(hex)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShadeTintGenerator;