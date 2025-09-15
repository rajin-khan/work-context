// src/components/ui/FormatDropdown.jsx
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const formats = ['HEX', 'HEXA', 'RGB', 'RGBA', 'HSL', 'HSLA'];

const FormatDropdown = ({ isOpen, anchorEl, onClose, onFormatSelect }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4, // Position below the button with a small gap
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen, anchorEl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div ref={dropdownRef} style={{ top: position.top, left: position.left, width: anchorEl?.offsetWidth }} className="absolute z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg overflow-hidden"
          >
            {formats.map(f => (
              <a
                key={f}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onFormatSelect(f);
                }}
                className="block px-3 py-2 text-sm text-neutral-300 hover:bg-brand hover:text-white"
              >
                {f}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default FormatDropdown;