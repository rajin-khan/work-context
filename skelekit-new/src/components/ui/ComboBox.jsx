// src/components/ui/ComboBox.jsx
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronsUpDown } from 'lucide-react';

const ComboBox = ({ options, selected, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const comboRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (comboRef.current && !comboRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = query === ''
    ? options
    : options.filter(option =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );

  const selectedLabel = options.find(opt => opt.value === selected)?.label || placeholder;

  return (
    <div className="relative w-full" ref={comboRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 rounded-md hover:border-neutral-700 transition-colors focus:outline-none focus:border-neutral-600"
      >
        <span className="text-neutral-200 truncate">{selectedLabel}</span>
        <ChevronsUpDown size={16} className="text-neutral-500 ml-2 shrink-0" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg overflow-hidden"
          >
            <div className="p-2">
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {filteredOptions.map(option => (
                <li
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center justify-between px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 cursor-pointer"
                >
                  <span className="truncate">{option.label}</span>
                  {selected === option.value && <Check size={16} className="text-white" />}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComboBox;