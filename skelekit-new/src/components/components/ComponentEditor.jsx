// src/components/components/ComponentEditor.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ComponentModifierList from './ComponentModifierList';
import ComponentCSSDisplay from './ComponentCSSDisplay';
import ComponentPreview from './ComponentPreview'; // Import the live preview component
import { nanoid } from 'nanoid';

const ComponentEditor = ({ component, setComponent, onSave, onDiscard }) => {
  const [activeSelection, setActiveSelection] = useState({ type: 'base' });

  useEffect(() => {
    setActiveSelection({ type: 'base' });
  }, [component.id]);

  const handleUpdateComponentName = (newName) => {
    setComponent(prev => ({ ...prev, name: newName }));
  };

  const handleAddModifier = () => {
    const newModifier = {
      id: nanoid(),
      name: `modifier-${(component.modifiers?.length || 0) + 1}`,
      styles: {},
      states: {},
    };
    const newModifiers = [...(component.modifiers || []), newModifier];
    setComponent(prev => ({ ...prev, modifiers: newModifiers }));
    setActiveSelection({ type: 'modifier', id: newModifier.id });
  };
  
  const handleUpdateModifier = (id, updates) => {
      setComponent(prev => ({
          ...prev,
          modifiers: prev.modifiers.map(mod => mod.id === id ? { ...mod, ...updates } : mod)
      }));
  };

  const handleRemoveModifier = (id) => {
      setComponent(prev => ({
          ...prev,
          modifiers: prev.modifiers.filter(mod => mod.id !== id)
      }));
      if (activeSelection.type.startsWith('modifier') && activeSelection.id === id) {
          setActiveSelection({ type: 'base' });
      }
  };

  const handleAddState = (modifierId, state) => {
    if (!modifierId) {
      if (component.states?.[state]) return;
      const newStates = { ...(component.states || {}), [state]: {} };
      setComponent(prev => ({ ...prev, states: newStates }));
      setActiveSelection({type: 'baseState', state: state});
    } else {
      const mod = component.modifiers.find(m => m.id === modifierId);
      if(mod.states?.[state]) return;
      handleUpdateModifier(modifierId, {
        states: { ...mod.states, [state]: {} }
      });
      setActiveSelection({ type: 'modifierState', id: modifierId, state: state });
    }
  };

  const handleRemoveState = (modifierId, state) => {
    if (!modifierId) {
        const newStates = { ...component.states };
        delete newStates[state];
        setComponent(prev => ({ ...prev, states: newStates }));
    } else {
        const mod = component.modifiers.find(m => m.id === modifierId);
        const newStates = { ...mod.states };
        delete newStates[state];
        handleUpdateModifier(modifierId, { states: newStates });
    }
    if (activeSelection.state === state && (activeSelection.id === modifierId || (activeSelection.type === 'baseState' && !modifierId))) {
        setActiveSelection(modifierId ? { type: 'modifier', id: modifierId } : { type: 'base' });
    }
  };


  const handleUpdateStyles = (newStyles) => {
    setComponent(prev => {
        const componentCopy = JSON.parse(JSON.stringify(prev));
        switch(activeSelection.type) {
            case 'base':
                componentCopy.styles = newStyles;
                break;
            case 'baseState':
                componentCopy.states[activeSelection.state] = newStyles;
                break;
            case 'modifier':
                componentCopy.modifiers.find(m => m.id === activeSelection.id).styles = newStyles;
                break;
            case 'modifierState':
                componentCopy.modifiers.find(m => m.id === activeSelection.id).states[activeSelection.state] = newStyles;
                break;
            default:
                break;
        }
        return componentCopy;
    });
  };

  const getActiveStylesAndName = () => {
    switch(activeSelection.type) {
        case 'base':
            return { styles: component.styles, name: `.${component.name}` };
        case 'baseState':
            return { styles: component.states?.[activeSelection.state] || {}, name: `.${component.name}:${activeSelection.state}` };
        case 'modifier':
            const mod = component.modifiers?.find(m => m.id === activeSelection.id);
            return { styles: mod?.styles || {}, name: `.${component.name}.${mod?.name}` };
        case 'modifierState':
             const modifier = component.modifiers?.find(m => m.id === activeSelection.id);
             return { styles: modifier?.states?.[activeSelection.state] || {}, name: `.${component.name}.${modifier?.name}:${activeSelection.state}` };
        default:
            return { styles: {}, name: '' };
    }
  };

  const { styles: activeStyles, name: activeName } = getActiveStylesAndName();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex"
    >
      <ComponentModifierList
        component={component}
        activeSelection={activeSelection}
        onSelect={setActiveSelection}
        onUpdateComponentName={handleUpdateComponentName}
        onAddState={handleAddState}
        onRemoveState={handleRemoveState}
        onAddModifier={handleAddModifier}
        onUpdateModifier={handleUpdateModifier}
        onRemoveModifier={handleRemoveModifier}
      />

      <div className="flex-1 bg-neutral-900 flex items-center justify-center p-8">
        <motion.div 
          className="w-full h-full bg-white rounded-md flex items-center justify-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <ComponentPreview component={component} />
        </motion.div>
      </div>

      <ComponentCSSDisplay
        styles={activeStyles}
        onUpdateStyles={handleUpdateStyles}
        activeModifier={activeName}
      />
    </motion.div>
  );
};

export default ComponentEditor;