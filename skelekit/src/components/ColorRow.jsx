// src/components/ColorRow.jsx
import React, { useState, useRef, useEffect } from 'react';
import { colord } from 'colord';
import { ChevronDown, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ColorPickerComponent from './ColorPickerComponent';
import toast from 'react-hot-toast';

const formats = ['HEX', 'HEXA', 'RGB', 'RGBA', 'HSL', 'HSLA'];

const ColorRow = ({ color, onUpdate, onDelete }) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const pickerRef = useRef(null);

  const handleValueChange = (newValue) => {
    if (colord(newValue).isValid()) {
      onUpdate(color.id, { value: newValue });
    }
  };

  const handleFormatChange = (newFormat) => {
    onUpdate(color.id, { format: newFormat });
    setDropdownOpen(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(displayedValue);
    toast.success('Color copied to clipboard!');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerRef]);

  const getDisplayedValue = () => {
    const c = colord(color.value);
    if (!c.isValid()) return color.value; 

    switch (color.format.toUpperCase()) {
      case 'HEX': return c.toHex();
      case 'HEXA': return c.toHex(); 
      case 'RGB': return c.toRgbString();
      case 'RGBA': return c.toRgbaString();
      case 'HSL': return c.toHslString();
      case 'HSLA': return c.toHslString();
      default: return c.toHex();
    }
  };

  const displayedValue = getDisplayedValue();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      <div className="flex items-center gap-2 p-1 bg-neutral-950 rounded-md border border-neutral-900 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/50 transition-all">
        <button 
          className="w-8 h-8 rounded-md flex-shrink-0 border-2 border-neutral-800 transition-transform duration-200 hover:scale-110" 
          style={{ backgroundColor: color.value }}
          onClick={() => setPickerVisible(!isPickerVisible)}
        />
        <input 
          value={color.name}
          onChange={(e) => onUpdate(color.id, { name: e.target.value })}
          // ** THIS IS THE CHANGE ** 
          // Increased width for better balance in the wider layout.
          className="w-64 bg-transparent focus:outline-none px-2 py-1.5"
        />
        <input 
          value={displayedValue}
          onChange={(e) => onUpdate(color.id, { value: e.target.value })}
          onDoubleClick={handleCopy}
          className="flex-1 font-mono bg-neutral-900 rounded-md px-3 py-1.5 text-sm text-neutral-200 border border-neutral-800 focus:outline-none focus:border-brand"
        />
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-24 px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 rounded-md hover:bg-neutral-800 transition-colors"
          >
            {color.format}
            <ChevronDown size={16} className="text-neutral-500" />
          </button>
          {isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-md shadow-lg overflow-hidden"
            >
              {formats.map(f => (
                <a key={f} href="#" onClick={(e) => { e.preventDefault(); handleFormatChange(f); }} className="block px-3 py-2 text-sm text-neutral-300 hover:bg-brand hover:text-white">
                  {f}
                </a>
              ))}
            </motion.div>
          )}
        </div>
        <button className="p-2 text-neutral-600 rounded-md hover:bg-neutral-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDelete(color.id)}>
          <Trash2 size={16} />
        </button>
      </div>

      {isPickerVisible && (
        <motion.div 
          ref={pickerRef} 
          className="absolute z-20 mt-2 left-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <ColorPickerComponent 
            color={color.value}
            format={color.format}
            onChange={handleValueChange}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ColorRow;