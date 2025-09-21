// src/components/ColorPickerPopover.jsx
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPickerComponent from './ColorPickerComponent';

const ColorPickerPopover = ({ isOpen, anchorEl, onClose, color, format, onChange }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const pickerRef = useRef(null);

  useEffect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8, // Position below the anchor with a gap
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen, anchorEl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && pickerRef.current && !pickerRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);
  
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <motion.div
      ref={pickerRef}
      style={{ top: position.top, left: position.left }}
      className="absolute z-50"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      <ColorPickerComponent
        color={color}
        format={format}
        onChange={onChange}
      />
    </motion.div>,
    document.body
  );
};

export default ColorPickerPopover;