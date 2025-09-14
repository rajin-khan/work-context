// src/components/ui/Select.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Select = ({ options, selected, onSelect, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find(opt => opt.value === selected);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
        {label && <label className="text-sm font-medium text-neutral-300 mb-2 block">{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md hover:border-neutral-700 transition-colors focus:outline-none focus:border-neutral-600"
      >
        <span className="text-neutral-200">{selectedOption ? selectedOption.label : 'Select...'}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={16} className="text-neutral-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto"
          >
            {options.map(option => (
              <a
                key={option.value}
                href="#"
                onClick={(e) => { e.preventDefault(); onSelect(option.value); setIsOpen(false); }}
                // ** THE CHANGE: Selected item is now a neutral gray **
                className={`block px-3 py-2 text-sm transition-colors ${
                  selected === option.value
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-300 hover:bg-neutral-700/50'
                }`}
              >
                {option.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;