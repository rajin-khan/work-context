// src/components/components/StateSelectorDropdown.jsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const availableStates = [
  'active', 'checked', 'disabled', 'empty', 'enabled',
  'first-child', 'first-of-type', 'focus', 'focus-visible', 'focus-within',
  'hover', 'in-range', 'invalid', 'last-child', 'last-of-type',
  'link', 'only-child', 'only-of-type', 'optional', 'placeholder-shown',
  'read-only', 'read-write', 'required', 'root', 'target', 'valid', 'visited',
  'before', 'after'
];

const StateSelectorDropdown = ({ isOpen, anchorEl, onClose, onStateSelect }) => {
  const dropdownRef = useRef(null);

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

  const rect = anchorEl.getBoundingClientRect();
  const position = {
    top: rect.bottom + window.scrollY + 8,
    left: rect.left + window.scrollX,
  };

  return ReactDOM.createPortal(
    <div ref={dropdownRef} style={{ top: position.top, left: position.left }} className="absolute z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="w-48 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg overflow-hidden max-h-72 overflow-y-auto"
          >
            {availableStates.map(state => (
              <a
                key={state}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onStateSelect(state);
                }}
                className="block px-3 py-2 text-sm text-neutral-300 hover:bg-brand hover:text-white"
              >
                :{state}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default StateSelectorDropdown;