// src/components/spacing/SpacingVisualization.jsx
import React from 'react';
import { motion } from 'framer-motion';
// ** THE CHANGE: Import Plus and Minus icons **
import { Monitor, Smartphone, Plus, Minus } from 'lucide-react';

// This is your provided, working SpacingRow component. It remains unchanged.
const SpacingRow = ({ name, min, max, isBase }) => {
  const MAX_SCALE_PX = 500;
  const minBarPercent = Math.min((min / MAX_SCALE_PX) * 100, 100);
  const maxBarPercent = Math.min((max / MAX_SCALE_PX) * 100, 100);

  return (
    <div className={`flex items-center px-6 py-5 border-b border-neutral-800 last:border-b-0 transition-colors ${isBase ? 'bg-brand/10' : ''}`}>
      <div className="w-48 pr-4 shrink-0 flex items-center">
        {isBase && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-semibold bg-brand text-white px-2.5 py-1 rounded-full mr-4"
          >
            Base
          </motion.span>
        )}
        <span className={`font-mono text-sm transition-colors ${isBase ? 'text-neutral-200' : 'text-neutral-400'}`}>{name}</span>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center w-full gap-4">
          <Smartphone size={16} className="text-neutral-500" />
          <span className="font-mono text-sm text-neutral-200 w-16 text-right">{min}px</span>
          <div className="flex-1 bg-black h-3 rounded-full overflow-hidden">
             <motion.div
                className="bg-neutral-700 h-3 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${minBarPercent}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
             />
          </div>
        </div>
        <div className="flex items-center w-full gap-4">
          <Monitor size={16} className="text-neutral-500" />
          <span className="font-mono text-sm text-neutral-200 w-16 text-right">{max}px</span>
          <div className="flex-1 bg-black h-3 rounded-full overflow-hidden">
            <motion.div
                className="bg-neutral-700 h-3 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${maxBarPercent}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ** THE CHANGE: Add a new, simple component for the control buttons **
const StepControlButton = ({ icon: Icon, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className="p-2 text-neutral-500 rounded-full hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
        <Icon size={16} />
    </button>
);

// ** THE CHANGE: The main component now accepts `onStepsChange` and `steps` props **
const SpacingVisualization = ({ scale, onStepsChange, steps }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto my-8">
        <div className="bg-black border border-neutral-800 rounded-lg shadow-lg">
          
          {/* Top control buttons are added here */}
          <div className="flex justify-center items-center py-2 border-b border-neutral-800">
              <StepControlButton 
                icon={Plus} 
                onClick={() => onStepsChange('negative', 1)}
                disabled={steps.negative >= 25}
              />
              <StepControlButton 
                icon={Minus} 
                onClick={() => onStepsChange('negative', -1)}
                disabled={steps.negative <= 1}
              />
          </div>

          {/* This is the original, working map */}
          {scale.map((item) => (
            <SpacingRow key={item.id} {...item} />
          ))}

          {/* Bottom control buttons are added here */}
          <div className="flex justify-center items-center py-2 border-t border-neutral-800">
              <StepControlButton 
                icon={Plus} 
                onClick={() => onStepsChange('positive', 1)}
                disabled={steps.positive >= 25}
              />
              <StepControlButton 
                icon={Minus} 
                onClick={() => onStepsChange('positive', -1)}
                disabled={steps.positive <= 1}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacingVisualization;