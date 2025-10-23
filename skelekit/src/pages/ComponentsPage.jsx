// src/pages/ComponentsPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InitialComponentView from '../components/components/InitialComponentView';
import ComponentGrid from '../components/components/ComponentGrid';
import FeatureHeader from '../components/ui/FeatureHeader';
import AddComponentModal from '../components/components/AddComponentModal'; // Import the new modal
import { Plus } from 'lucide-react';

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
  const [isAdding, setIsAdding] = useState(false);
  const hasComponents = components.length > 0;

  return (
    <motion.div
      className="max-w-7xl mx-auto p-8 h-full flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex justify-between items-start mb-10">
        <FeatureHeader
          title="Components"
          description="Create and customize reusable components for your design system. Start with pre-made templates and tailor them to your needs."
        />
        {/* This button correctly sets the state to show the modal */}
        {hasComponents && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 hover:text-neutral-800 hover:border-neutral-400 transition-all whitespace-nowrap"
          >
            <Plus size={16} />
            Add Component
          </button>
        )}
      </div>
      
      <div className="flex-1">
        {hasComponents ? (
          <ComponentGrid
            components={components}
            onEditComponent={onEditComponent}
            colorGroups={colorGroups}
            spacingGroups={spacingGroups}
            typographyGroups={typographyGroups}
            layoutVariableGroups={layoutVariableGroups}
            designVariableGroups={designVariableGroups}
          />
        ) : (
          // The initial view now just needs a single function to open the modal
          <InitialComponentView onAddClick={() => setIsAdding(true)} />
        )}
      </div>

      {/* --- START OF THE FIX --- */}
      {/* 
        The AddComponentModal is now rendered here, inside the ComponentsPage.
        It's always part of the component tree, ready to be displayed
        when `isAdding` becomes true.
      */}
      <AddComponentModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onAddComponent={onAddComponent}
      />
      {/* --- END OF THE FIX --- */}
    </motion.div>
  );
};

export default ComponentsPage;