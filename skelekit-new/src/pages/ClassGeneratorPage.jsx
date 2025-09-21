// src/pages/ClassGeneratorPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ClassGenerator from '../components/spacing/ClassGenerator';
import FeatureHeader from '../components/ui/FeatureHeader';

const ClassGeneratorPage = ({ 
  generatorConfig, 
  onGeneratorChange, 
  onAddClass, 
  onRemoveClass,
  spacingGroups // Now receiving the full list of groups
}) => (
  <motion.div 
    className="max-w-5xl mx-auto p-8"
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.3 }}
  >
    <FeatureHeader
      title="Class Generator"
      description="Enable and customize utility classes. Each generator can be linked to a specific spacing scale for granular control over your design system."
    />
    <ClassGenerator 
      config={generatorConfig} 
      onConfigChange={onGeneratorChange} 
      onAddClass={onAddClass} 
      onRemoveClass={onRemoveClass}
      spacingGroups={spacingGroups} // Pass the groups down
    />
  </motion.div>
);

export default ClassGeneratorPage;