// src/pages/ClassGeneratorPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ClassGenerator from '../components/spacing/ClassGenerator';

const ClassGeneratorPage = ({ 
  generatorConfig, 
  onGeneratorChange, 
  onAddClass, 
  onRemoveClass 
}) => (
  <motion.div 
    className="max-w-5xl mx-auto p-8"
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.3 }}
  >
    <ClassGenerator 
      config={generatorConfig} 
      onConfigChange={onGeneratorChange} 
      onAddClass={onAddClass} 
      onRemoveClass={onRemoveClass} 
    />
  </motion.div>
);

export default ClassGeneratorPage;