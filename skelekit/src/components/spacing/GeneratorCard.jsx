// src/components/spacing/GeneratorCard.jsx
import React from 'react';
// ** THE FIX: Re-import AnimatePresence **
import { motion, AnimatePresence } from 'framer-motion';
import Switch from '../ui/Switch';
import PropertyPill from './PropertyPill';
import { Plus, X } from 'lucide-react';

const GeneratorCard = ({ id, className, properties, enabled, onUpdate, onRemove }) => {
  const [newlyAddedIndex, setNewlyAddedIndex] = React.useState(null);
  const [editableName, setEditableName] = React.useState(className.slice(1, -2));

  React.useEffect(() => {
    setEditableName(className.slice(1, -2));
  }, [className]);

  const handleToggle = () => onUpdate(id, { enabled: !enabled });

  const handlePropertyChange = (indexToUpdate, newValue) => {
    const newProperties = properties.map((prop, index) =>
      index === indexToUpdate ? newValue : prop
    );
    onUpdate(id, { properties: newProperties });
  };

  const handleAddProperty = () => {
    const newProperties = [...properties, ''];
    setNewlyAddedIndex(properties.length);
    onUpdate(id, { properties: newProperties });
  };

  const handleRemoveProperty = (indexToRemove) => {
    const newProperties = properties.filter((_, index) => index !== indexToRemove);
    onUpdate(id, { properties: newProperties });
  };

  const handleClassNameChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    setEditableName(sanitizedValue);
  };
  
  const handleClassNameBlur = () => {
    onUpdate(id, { className: `.${editableName}-*` });
  };

  return (
    <motion.div 
      layout="position"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="relative bg-neutral-950 border border-neutral-800 rounded-lg flex transition-colors group"
    >
      <button 
        onClick={onRemove}
        className="absolute top-3 right-3 p-1.5 text-neutral-600 rounded-full hover:bg-neutral-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Remove class generator"
      >
        <X size={16} />
      </button>

      <div className="w-1/3 p-6 flex flex-col justify-center gap-4">
        <Switch enabled={enabled} setEnabled={handleToggle} />
        <div>
          <div className="relative font-mono text-xl font-semibold text-white flex items-center bg-neutral-900 border border-transparent rounded focus-within:border-brand">
            <span className="pl-3 opacity-50 select-none pointer-events-none">.</span>
            <input 
              type="text"
              value={editableName}
              onChange={handleClassNameChange}
              onBlur={handleClassNameBlur}
              className="bg-transparent focus:outline-none py-1 flex-1 min-w-0"
              style={{ paddingLeft: '1px', paddingRight: '2px' }}
            />
            <span className="pr-3 opacity-50 select-none pointer-events-none">-*</span>
          </div>

          <p className="text-sm text-neutral-400 mt-1 pl-1">
            {enabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 border-l border-neutral-800">
        <h4 className="text-sm font-medium text-neutral-400 mb-3">Generates Properties</h4>
        <div className="flex flex-wrap items-center gap-2">
          {/* ** THE FIX: Re-added AnimatePresence and the motion.div wrapper ** */}
          <AnimatePresence>
            {properties.map((prop, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <PropertyPill
                  value={prop}
                  onChange={(newValue) => handlePropertyChange(index, newValue)}
                  onRemove={() => handleRemoveProperty(index)}
                  startInEditMode={index === newlyAddedIndex}
                  onEditComplete={() => setNewlyAddedIndex(null)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <button 
            onClick={handleAddProperty}
            className="w-8 h-8 flex items-center justify-center bg-neutral-800 text-neutral-500 rounded-full hover:bg-brand hover:text-white transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GeneratorCard;