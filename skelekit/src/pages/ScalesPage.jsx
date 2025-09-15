// src/pages/ScalesPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import SpacingSidebar from '../components/spacing/SpacingSidebar';
import SpacingVisualization from '../components/spacing/SpacingVisualization';

const ScalesPage = ({ 
  spacingSettings, 
  onSettingsChange, 
  scale, 
  onStepsChange 
}) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.3 }}
  >
    <div className="relative flex">
      <SpacingSidebar 
        settings={spacingSettings} 
        onSettingsChange={onSettingsChange} 
        scaleOptions={scale} 
      />
      <div className="flex-1">
        <SpacingVisualization 
          scale={scale} 
          onStepsChange={onStepsChange} 
          steps={{ 
            negative: spacingSettings.negativeSteps, 
            positive: spacingSettings.positiveSteps 
          }} 
        />
      </div>
    </div>
  </motion.div>
);

export default ScalesPage;