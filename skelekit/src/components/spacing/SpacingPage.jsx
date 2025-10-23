// src/components/spacing/SpacingPage.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpacingSidebar from './SpacingSidebar';
import SpacingVisualization from './SpacingVisualization';
import ClassGenerator from './ClassGenerator';
import SelectorGroup from './SelectorGroup';
import VariableGroup from './VariableGroup';
import { spacingProperties } from '../../utils/cssProperties';
import { Plus } from 'lucide-react';

const SpacingPage = ({
  settings, onSettingsChange, scale, onStepsChange,
  generatorConfig, onGeneratorChange, onAddClass, onRemoveClass,
  selectorGroups, onAddSelectorGroup, onUpdateSelectorGroup, onRemoveSelectorGroup,
  variableGroups, onAddVariableGroup, onUpdateVariableGroup, onRemoveVariableGroup
}) => {
  
  // ** THIS IS THE CHANGE: Create a new memoized list of ALL variables **
  const allVariableOptions = useMemo(() => {
    // Start with the dynamic spacing scale variables
    const scaleOptions = scale.map(item => ({ 
      label: `var(${item.name})`, 
      value: `var(${item.name})` 
    }));
    
    // Flatten all custom variables from all groups into a single list
    const customVarOptions = variableGroups.flatMap(group => 
      group.variables.map(variable => ({
        label: `var(${variable.name})`,
        value: `var(${variable.name})`
      }))
    );
    
    // Combine them into one comprehensive list
    return [...scaleOptions, ...customVarOptions];
  }, [scale, variableGroups]);
  
  const propertyOptions = useMemo(() => {
    return spacingProperties.map(prop => ({ label: prop, value: prop }));
  }, []);

  return (
    <motion.div
      className="flex-1 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex">
        <SpacingSidebar 
          settings={settings} 
          onSettingsChange={onSettingsChange}
          scaleOptions={scale}
        />
        <div className="flex-1">
          <SpacingVisualization 
            scale={scale} 
            onStepsChange={onStepsChange}
            steps={{ negative: settings.negativeSteps, positive: settings.positiveSteps }}
          />
        </div>
      </div>

      <ClassGenerator 
        config={generatorConfig}
        onConfigChange={onGeneratorChange}
        onAddClass={onAddClass}
        onRemoveClass={onRemoveClass}
      />

      <AnimatePresence>
        {selectorGroups.map(group => (
          <SelectorGroup 
            key={group.id}
            group={group}
            onUpdate={onUpdateSelectorGroup}
            onRemove={() => onRemoveSelectorGroup(group.id)}
            spacingVariableOptions={allVariableOptions}
            propertyOptions={propertyOptions}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {variableGroups.map(group => (
          <VariableGroup 
            key={group.id} 
            group={group} 
            onUpdate={onUpdateVariableGroup} 
            onRemove={() => onRemoveVariableGroup(group.id)} 
          />
        ))}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto my-8 px-4 flex items-center justify-center gap-4">
        <button
          onClick={onAddSelectorGroup}
          className="text-neutral-600 hover:text-neutral-800 font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400"
        >
          <Plus size={16} /> Create Selector Group
        </button>
        <button
          onClick={onAddVariableGroup}
          className="text-neutral-600 hover:text-neutral-800 font-medium text-sm py-2 px-4 rounded-full transition-colors flex items-center gap-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400"
        >
          <Plus size={16} /> Create Variable Group
        </button>
      </div>
    </motion.div>
  );
};

export default SpacingPage;