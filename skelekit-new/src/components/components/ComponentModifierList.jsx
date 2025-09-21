// src/components/components/ComponentModifierList.jsx
import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';
import StateSelectorDropdown from './StateSelectorDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const ModifierRow = ({
  prefix = '',
  name,
  isActive,
  onClick,
  isEditable = false,
  onNameChange,
  onAddState,
  onRemove,
}) => {
  const stateButtonRef = useRef(null);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);

  return (
    <div
      onClick={onClick}
      className={clsx(
        'w-full text-left rounded-md text-sm group/row relative cursor-pointer',
        { 'text-white': isActive, 'text-neutral-400 hover:bg-neutral-800': !isActive }
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeModifier"
          className="absolute inset-0 bg-brand rounded-md"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <div className="relative flex items-center justify-between pl-3 pr-1.5 py-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {prefix && <span className={clsx("font-mono", { "text-neutral-500": !isActive, "text-white/60": isActive })}>{prefix}</span>}
          {isEditable ? (
            <input
              type="text"
              value={name}
              onClick={(e) => e.stopPropagation()} // Prevent row click when editing name
              onChange={(e) => onNameChange(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
              className="bg-transparent focus:outline-none w-full py-0.5"
            />
          ) : (
            <span className="py-0.5 flex-1 truncate">{name}</span>
          )}
        </div>
        <div className="flex items-center">
          {onAddState && (
            <button
              ref={stateButtonRef}
              onClick={(e) => { e.stopPropagation(); setIsStateDropdownOpen(true); }}
              className="p-1.5 rounded-md hover:bg-black/20 flex items-center gap-1 text-neutral-400 opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <Plus size={14} />
            </button>
          )}
          {onRemove && (
             <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1 rounded-md text-neutral-500 hover:bg-black/20 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
              >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      {onAddState && (
        <StateSelectorDropdown
            isOpen={isStateDropdownOpen}
            anchorEl={stateButtonRef.current}
            onClose={() => setIsStateDropdownOpen(false)}
            onStateSelect={(state) => { onAddState(state); setIsStateDropdownOpen(false); }}
        />
      )}
    </div>
  );
};

const ComponentModifierList = ({
  component,
  activeSelection,
  onSelect,
  onUpdateComponentName,
  onAddState,
  onRemoveState,
  onAddModifier,
  onUpdateModifier,
  onRemoveModifier,
}) => {
  return (
    <div className="w-64 bg-neutral-950 border-r border-neutral-800 p-4 space-y-6 overflow-y-auto">
      <div>
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">
          Default Style
        </h3>
        <div className="space-y-1">
          <ModifierRow
            prefix="."
            name={component.name}
            isEditable={true}
            onNameChange={onUpdateComponentName}
            isActive={activeSelection.type === 'base'}
            onClick={() => onSelect({ type: 'base' })}
            onAddState={(state) => onAddState(null, state)}
          />
          <AnimatePresence>
            {Object.keys(component.states || {}).map(state => (
              <motion.div 
                key={state} 
                layout 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="pl-4"
              >
                <ModifierRow
                  prefix=":"
                  name={state}
                  isActive={activeSelection.type === 'baseState' && activeSelection.state === state}
                  onClick={() => onSelect({ type: 'baseState', state: state })}
                  onRemove={() => onRemoveState(null, state)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">
            Modifiers
        </h3>
        <div className="space-y-3">
          <AnimatePresence>
            {(component.modifiers || []).map(mod => (
              <motion.div 
                key={mod.id} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                  <ModifierRow
                      prefix="."
                      name={mod.name}
                      isEditable={true}
                      onNameChange={(newName) => onUpdateModifier(mod.id, { name: newName })}
                      isActive={activeSelection.type === 'modifier' && activeSelection.id === mod.id}
                      onClick={() => onSelect({ type: 'modifier', id: mod.id })}
                      onAddState={(state) => onAddState(mod.id, state)}
                      onRemove={() => onRemoveModifier(mod.id)}
                  />
                  <div className="mt-1 space-y-1">
                    <AnimatePresence>
                      {Object.keys(mod.states || {}).map(state => (
                          <motion.div 
                            key={state} 
                            layout="position"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4"
                           >
                            <ModifierRow
                                prefix=":"
                                name={state}
                                isActive={activeSelection.type === 'modifierState' && activeSelection.id === mod.id && activeSelection.state === state}
                                onClick={() => onSelect({ type: 'modifierState', id: mod.id, state: state })}
                                onRemove={() => onRemoveState(mod.id, state)}
                            />
                          </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <button
          onClick={onAddModifier}
          className="w-full flex items-center justify-start gap-2 px-3 py-2 mt-4 text-sm font-medium text-neutral-500 rounded-md hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
        >
          <Plus size={16} /> Add Modifier
        </button>
      </div>
    </div>
  );
};

export default ComponentModifierList;