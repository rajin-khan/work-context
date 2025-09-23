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

// --- START OF THE FIX ---
// Destructure all the new props to be passed down
const ComponentGrid = ({ 
  components, 
  onEditComponent,
  colorGroups,
  spacingGroups,
  typographyGroups,
  layoutVariableGroups,
  designVariableGroups,
}) => {
// --- END OF THE FIX ---
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={gridVariants}
      initial="hidden"
      animate="visible"
    >
      {components.map((component) => (
        // --- START OF THE FIX ---
        // Pass all the data props down to each individual card
        <ComponentPreviewCard
          key={component.id}
          component={component}
          onEdit={() => onEditComponent(component.id)}
          colorGroups={colorGroups}
          spacingGroups={spacingGroups}
          typographyGroups={typographyGroups}
          layoutVariableGroups={layoutVariableGroups}
          designVariableGroups={designVariableGroups}
        />
        // --- END OF THE FIX ---
      ))}
    </motion.div>
  );
};

export default ComponentGrid;