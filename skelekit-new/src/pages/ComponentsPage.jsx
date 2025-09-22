// src/pages/ComponentsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import InitialComponentView from '../components/components/InitialComponentView';
import ComponentGrid from '../components/components/ComponentGrid';
import FeatureHeader from '../components/ui/FeatureHeader';

// --- START OF THE FIX ---
// Destructure all the necessary data props that need to be passed down
const ComponentsPage = ({
  components,
  onAddComponent,
  onEditComponent,
  colorGroups,
  spacingGroups,
  typographyGroups,
  layoutVariableGroups,
  designVariableGroups,
}) => {
// --- END OF THE FIX ---
  const hasComponents = components.length > 0;

  return (
    <motion.div
      className="max-w-7xl mx-auto p-8 h-full flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <FeatureHeader
        title="Components"
        description="Create and customize reusable components for your design system. Start with pre-made templates and tailor them to your needs."
      />
      <div className="flex-1">
        {hasComponents ? (
          // --- START OF THE FIX ---
          // Pass all the data props down to the grid
          <ComponentGrid
            components={components}
            onEditComponent={onEditComponent}
            colorGroups={colorGroups}
            spacingGroups={spacingGroups}
            typographyGroups={typographyGroups}
            layoutVariableGroups={layoutVariableGroups}
            designVariableGroups={designVariableGroups}
          />
          // --- END OF THE FIX ---
        ) : (
          <InitialComponentView onAddComponent={onAddComponent} />
        )}
      </div>
    </motion.div>
  );
};

export default ComponentsPage;