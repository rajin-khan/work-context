// src/components/ui/EditableSwatch.jsx
import React from 'react';
import { colord } from 'colord';
import toast from 'react-hot-toast';
import { Copy, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';

const EditableSwatch = ({ color, onEdit, onCopy }) => {
  const colorStr = colord(color).toRgbString();
  const hexValue = colord(color).toHex();

  const handleCopy = (e) => {
    e.stopPropagation(); // Prevent onEdit from firing
    onCopy(hexValue);
    toast.success(`Copied ${hexValue} to clipboard!`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      // ** THIS IS THE FIX: Replaced 'aspect-square' with a fixed height 'h-12' **
      className="relative group h-12 rounded-lg"
      style={{ backgroundColor: colorStr }}
    >
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
        <button onClick={onEdit} className="p-2 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors">
            <Pencil size={16} />
        </button>
        <button onClick={handleCopy} className="p-2 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors">
            <Copy size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default EditableSwatch;