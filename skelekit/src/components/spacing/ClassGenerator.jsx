// src/components/spacing/ClassGenerator.jsx
import React from 'react';
import GeneratorCard from './GeneratorCard';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FeatureHeader from '../ui/FeatureHeader';

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

const ClassGenerator = ({ config, onConfigChange, onAddClass, onRemoveClass }) => {
  return (
    <div>
      <FeatureHeader
        title="Class Generator"
        description="Enable and customize the utility classes that will be generated from your spacing scale. Add or remove CSS properties for complete control."
      />
      <div className="space-y-4">
        <AnimatePresence>
          {config.map(def => (
            <GeneratorCard
              key={def.id}
              id={def.id}
              className={def.className}
              properties={def.properties}
              enabled={def.enabled}
              onUpdate={onConfigChange}
              onRemove={() => onRemoveClass(def.id)}
            />
          ))}
        </AnimatePresence>
      </div>
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