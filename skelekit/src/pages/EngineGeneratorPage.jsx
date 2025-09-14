// src/pages/EngineGeneratorPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import SpacingSidebar from '../components/spacing/SpacingSidebar';
import SpacingVisualization from '../components/spacing/SpacingVisualization';
import ClassGenerator from '../components/spacing/ClassGenerator';

// ** THE FIX: Renamed settings to spacingSettings to match the prop being passed from App.jsx **
const EngineGeneratorPage = ({ 
  spacingSettings, 
  onSettingsChange, 
  scale, 
  onStepsChange, 
  generatorConfig, 
  onGeneratorChange, 
  onAddClass, 
  onRemoveClass 
}) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.3 }}
  >
    <div className="relative flex">
      {/* ** THE FIX: Pass the correctly named prop down ** */}
      <SpacingSidebar 
        settings={spacingSettings} 
        onSettingsChange={onSettingsChange} 
        scaleOptions={scale} 
      />
      <div className="flex-1">
        {/* ** THE FIX: Use the correctly named prop to access its properties ** */}
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
    <ClassGenerator 
      config={generatorConfig} 
      onConfigChange={onGeneratorChange} 
      onAddClass={onAddClass} 
      onRemoveClass={onRemoveClass} 
    />
  </motion.div>
);

export default EngineGeneratorPage;