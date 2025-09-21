// src/pages/TypographyClassGeneratorPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import TypographyClassGenerator from '../components/typography/TypographyClassGenerator';
import FeatureHeader from '../components/ui/FeatureHeader';

const TypographyClassGeneratorPage = ({ 
  typographyGeneratorConfig, 
  onTypographyGeneratorChange, 
  onAddTypographyClass, 
  onRemoveTypographyClass,
  typographyGroups
}) => (
  <motion.div 
    className="max-w-5xl mx-auto p-8"
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.3 }}
  >
    <FeatureHeader
      title="Typography Class Generator"
      description="Enable and customize utility classes for your typography. Each generator can be linked to a specific type scale for granular control over your design system."
    />
    <TypographyClassGenerator 
      config={typographyGeneratorConfig} 
      onConfigChange={onTypographyGeneratorChange} 
      onAddClass={onAddTypographyClass} 
      onRemoveClass={onRemoveTypographyClass}
      typographyGroups={typographyGroups}
    />
  </motion.div>
);

export default TypographyClassGeneratorPage;