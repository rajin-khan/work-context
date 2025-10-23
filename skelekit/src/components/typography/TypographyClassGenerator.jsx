// src/components/typography/TypographyClassGenerator.jsx
import React from 'react';
import TypographyGeneratorCard from './TypographyGeneratorCard';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// This is the new default configuration for the typography generator
export const initialTypographyClassDefinitions = [
  { id: 'font-size', className: '.text-*', properties: ['font-size'] },
];

const TypographyClassGenerator = ({ config, onConfigChange, onAddClass, onRemoveClass, typographyGroups }) => {
  return (
    <div>
      <div className="space-y-4">
        <AnimatePresence>
          {config.map(def => (
            <TypographyGeneratorCard
              key={def.id}
              id={def.id}
              className={def.className}
              properties={def.properties}
              enabled={def.enabled}
              scaleGroupId={def.scaleGroupId}
              typographyGroups={typographyGroups} // Pass the full list of available groups
              onUpdate={onConfigChange}
              onRemove={() => onRemoveClass(def.id)}
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-6 flex justify-center">
        <button 
          onClick={onAddClass}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral-100 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-800 hover:border-neutral-400 transition-all"
        >
          <Plus size={16} />
          Add Type Class Generator
        </button>
      </div>
    </div>
  );
};

export default TypographyClassGenerator;