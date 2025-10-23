// src/components/ui/Swatch.jsx
import React from 'react';
import { colord } from 'colord';
import toast from 'react-hot-toast';
import { Copy } from 'lucide-react';
import { motion } from 'framer-motion';

const Swatch = ({ color }) => {
  const colorStr = colord(color).toRgbString();
  const hexValue = colord(color).toHex();

  const handleCopy = () => {
    navigator.clipboard.writeText(hexValue);
    toast.success(`Copied ${hexValue} to clipboard!`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group aspect-square rounded-md cursor-pointer"
      style={{ backgroundColor: colorStr }}
      onClick={handleCopy}
    >
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
        <Copy size={16} className="text-white/90" />
        <span className="text-white font-mono text-xs mt-1">{hexValue}</span>
      </div>
    </motion.div>
  );
};

export default Swatch;