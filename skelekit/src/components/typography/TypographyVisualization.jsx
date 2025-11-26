// src/components/typography/TypographyVisualization.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Plus, Minus } from 'lucide-react';

const TypographyRow = ({ name, min, max, isBase }) => {
  return (
    // ** THE DEFINITIVE FIX: A 2-column grid **
    // 1. Column 1 (12rem): Holds the variable name. Its width is fixed.
    // 2. Column 2 (1fr): Holds the entire visualization block. It takes up all remaining space and will not grow.
    <div className={`grid grid-cols-[12rem_1fr] items-center px-6 py-5 border-b border-neutral-200 last:border-b-0 transition-colors ${isBase ? 'bg-brand/10' : ''}`}>
      
      {/* --- Column 1: Variable Name & Base Indicator --- */}
      <div className="pr-4 flex items-center">
        {isBase && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-semibold bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-full mr-4"
          >
            Base
          </motion.span>
        )}
        <span className={`font-mono text-sm truncate transition-colors ${isBase ? 'text-neutral-800' : 'text-neutral-600'}`}>{name}</span>
      </div>
      
      {/* --- Column 2: Stacked Visualization Block --- */}
      {/* This container uses flex-col to stack the min and max previews vertically */}
      <div className="flex flex-col gap-3 min-w-0">
        
        {/* Min Value Row */}
        <div className="flex items-center w-full gap-4">
          <Smartphone size={16} className="text-neutral-600 shrink-0" />
          <span className="font-mono text-sm text-neutral-800 w-16 text-right shrink-0">{min}px</span>
          <div className="flex-1 h-[50px] flex items-center overflow-hidden">
            <motion.span 
              key={`${name}-min`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="font-semibold text-neutral-800 whitespace-nowrap" 
              style={{ fontSize: `${min}px` }}
            >
              Minimum
            </motion.span>
          </div>
        </div>
        
        {/* Max Value Row */}
        <div className="flex items-center w-full gap-4">
          <Monitor size={16} className="text-neutral-600 shrink-0" />
          <span className="font-mono text-sm text-neutral-800 w-16 text-right shrink-0">{max}px</span>
          <div className="flex-1 h-[50px] flex items-center overflow-hidden">
            <motion.span 
              key={`${name}-max`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="font-semibold text-neutral-800 whitespace-nowrap" 
              style={{ fontSize: `${max}px` }}
            >
              Maximum
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepControlButton = ({ icon: Icon, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className="p-2 text-neutral-500 rounded-full hover:bg-neutral-100 hover:text-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
        <Icon size={16} />
    </button>
);

const TypographyVisualization = ({ scale, onStepsChange, steps }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto my-8">
        <div className="bg-white border border-neutral-300 rounded-lg shadow-lg">
          <div className="flex justify-center items-center py-2 border-b border-neutral-200">
              <StepControlButton 
                icon={Plus} 
                onClick={() => onStepsChange('negative', 1)}
                disabled={steps.negative >= 25}
              />
              <StepControlButton 
                icon={Minus} 
                onClick={() => onStepsChange('negative', -1)}
                disabled={steps.negative <= 0}
              />
          </div>
          {scale.map((item) => (
            <TypographyRow key={item.id} {...item} />
          ))}
          <div className="flex justify-center items-center py-2 border-t border-neutral-200">
              <StepControlButton 
                icon={Plus} 
                onClick={() => onStepsChange('positive', 1)}
                disabled={steps.positive >= 25}
              />
              <StepControlButton 
                icon={Minus} 
                onClick={() => onStepsChange('positive', -1)}
                disabled={steps.positive <= 0}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyVisualization;