// src/components/spacing/ClassGenerator.jsx
import React from 'react';
import GeneratorCard from './GeneratorCard';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ** CHANGE: Renamed to `initialClassDefinitions` and `id` is now a string **
export const initialClassDefinitions = [
  { id: 'padding', className: '.padding-*', properties: ['padding'] },
  { id: 'padding-left', className: '.padding-left-*', properties: ['padding-left'] },
  { id: 'padding-right', className: '.padding-right-*', properties: ['padding-right'] },
  { id: 'padding-top', className: '.padding-top-*', properties: ['padding-top'] },
  { id: 'padding-bottom', className: '.padding-bottom-*', properties: ['padding-bottom'] },
  { id: 'padding-horizontal', className: '.padding-horizontal-*', properties: ['padding-left', 'padding-right'] },
  { id: 'padding-vertical', className: '.padding-vertical-*', properties: ['padding-top', 'padding-bottom'] },
  { id: 'margin', className: '.margin-*', properties: ['margin'] },
  { id: 'margin-left', className: '.margin-left-*', properties: ['margin-left'] },
  { id: 'margin-right', className: '.margin-right-*', properties: ['margin-right'] },
  { id: 'margin-top', className: '.margin-top-*', properties: ['margin-top'] },
  { id: 'margin-bottom', className: '.margin-bottom-*', properties: ['margin-bottom'] },
  { id: 'margin-horizontal', className: '.margin-horizontal-*', properties: ['margin-left', 'margin-right'] },
  { id: 'margin-vertical', className: '.margin-vertical-*', properties: ['margin-top', 'margin-bottom'] },
  { id: 'gap', className: '.gap-*', properties: ['gap'] },
];

// ** CHANGE: Now accepts new handlers for adding/removing **
const ClassGenerator = ({ config, onConfigChange, onAddClass, onRemoveClass }) => {
  return (
    <div className="max-w-5xl mx-auto my-16 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Class Generator</h2>
        <p className="text-neutral-400 mt-2 max-w-2xl">
          Enable and customize the utility classes that will be generated from your spacing scale. Add or remove CSS properties for complete control.
        </p>
      </div>
      <div className="space-y-4">
        {/* ** CHANGE: Now iterates over the config state directly and wraps in AnimatePresence ** */}
        <AnimatePresence>
          {config.map(def => (
            <GeneratorCard
              key={def.id}
              id={def.id}
              className={def.className}
              properties={def.properties}
              enabled={def.enabled}
              onUpdate={onConfigChange}
              onRemove={() => onRemoveClass(def.id)} // Pass the remove handler down
            />
          ))}
        </AnimatePresence>
      </div>
      {/* ** THIS IS NEW: The "Add Class Generator" button ** */}
      <div className="mt-6 flex justify-center">
        <button 
          onClick={onAddClass}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-700 transition-all"
        >
          <Plus size={16} />
          Add Class Generator
        </button>
      </div>
    </div>
  );
};

export default ClassGenerator;