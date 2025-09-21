// src/components/components/ComponentGrid.jsx
import React from 'react';
import ComponentPreviewCard from './ComponentPreviewCard';
import { motion } from 'framer-motion';

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const ComponentGrid = ({ components, onEditComponent }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={gridVariants}
      initial="hidden"
      animate="visible"
    >
      {components.map((component) => (
        <ComponentPreviewCard
          key={component.id}
          component={component}
          onEdit={() => onEditComponent(component.id)}
        />
      ))}
    </motion.div>
  );
};

export default ComponentGrid;