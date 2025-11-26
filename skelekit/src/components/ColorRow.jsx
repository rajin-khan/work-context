// src/components/ColorRow.jsx
import React, { useState, useRef, useEffect } from 'react';
import { colord } from 'colord';
import chroma from 'chroma-js';
import { ChevronDown, Trash2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPickerPopover from './ColorPickerPopover';
import ShadeTintGenerator from './ShadeTintGenerator';
import Switch from './ui/Switch';
import UtilityClassGenerator from './ui/UtilityClassGenerator';
import toast from 'react-hot-toast';
import FormatDropdown from './ui/FormatDropdown'; // Import the new component

// This new function uses chroma.mix() for accurate shade and tint generation.
const generatePalette = (baseColor, count, type) => {
  try {
    const colors = [];
    const mode = 'lab'; // Use the perceptually uniform LAB color space for mixing
    const targetColor = type === 'shades' ? 'black' : 'white';

    // We create a series of mix ratios. This loop generates `count` colors
    // by mixing the base color with the target color (black or white) in increasing amounts.
    for (let i = 1; i <= count; i++) {
      // The ratio determines how much of the target color is mixed in.
      // A simple linear progression works well.
      const ratio = i / (count + 1);
      const newColor = chroma.mix(baseColor, targetColor, ratio, mode).hex();
      colors.push(newColor);
    }
    return colors;
  } catch (e) {
    console.error("Error generating palette:", e);
    // Fallback to an array of the base color if something goes wrong
    return Array(count).fill(baseColor);
  }
};

const ColorRow = ({ color, onUpdate, onDelete }) => {
  const [pickerState, setPickerState] = useState({ isOpen: false, anchorEl: null });
  const [isFormatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const formatButtonRef = useRef(null); // Ref for the format button
  
  const [editingSwatch, setEditingSwatch] = useState({ isOpen: false, anchorEl: null, color: null, index: null, format: 'HEX', type: null });
  
  const handleConfigChange = (type, newValues) => {
    const configName = `${type}Config`;
    const currentConfig = color[configName];
    const newConfig = { ...currentConfig, ...newValues };

    if (type === 'shades' || type === 'tints') {
        const justEnabled = newValues.enabled && !currentConfig.enabled;
        const countChanged = newValues.count && newValues.count !== currentConfig.count;

        if (justEnabled || (newConfig.enabled && countChanged)) {
          newConfig.palette = generatePalette(color.value, newConfig.count, type);
        } else if (newValues.enabled === false) {
          newConfig.palette = [];
        }
    }
    
    onUpdate(color.id, { [configName]: newConfig });
  };

  const handleValueChange = (colorResult) => {
    const { r, g, b, a } = colorResult.rgb;
    const newValue = `rgba(${r}, ${g}, ${b}, ${a})`;
    onUpdate(color.id, { value: newValue });
    setPickerState(prev => ({ ...prev, color: newValue }));
  };

  useEffect(() => {
    let updates = {};
    if (color.shadesConfig?.enabled) {
      updates.shadesConfig = {
        ...color.shadesConfig,
        palette: generatePalette(color.value, color.shadesConfig.count, 'shades')
      };
    }
    if (color.tintsConfig?.enabled) {
      updates.tintsConfig = {
        ...color.tintsConfig,
        palette: generatePalette(color.value, color.tintsConfig.count, 'tints')
      };
    }
    if (Object.keys(updates).length > 0) {
      onUpdate(color.id, updates);
    }
  }, [color.value]);

  const handleFormatChange = (newFormat) => {
    onUpdate(color.id, { format: newFormat });
    setFormatDropdownOpen(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(displayedValue);
    toast.success('Color copied to clipboard!');
  };

  const getDisplayedValue = () => {
    const c = colord(color.value);
    if (!c.isValid()) return color.value; 

    switch (color.format.toUpperCase()) {
      case 'HEX': return c.toHex();
      case 'HEXA': return c.toHex();
      case 'RGB': { const { r, g, b } = c.toRgb(); return `rgb(${r}, ${g}, ${b})`; }
      case 'RGBA': return c.toRgbString();
      case 'HSL': { const { h, s, l } = c.toHsl(); return `hsl(${h}, ${s}%, ${l}%)`; }
      case 'HSLA': return c.toHslString();
      default: return c.toHex();
    }
  };

  const displayedValue = getDisplayedValue();
  const colorSwatchValue = colord(color.value).toRgbString();

  const handleSwatchPickerChange = (colorResult) => {
    const { r, g, b, a } = colorResult.rgb;
    const newValue = `rgba(${r}, ${g}, ${b}, ${a})`;
    setEditingSwatch(prev => ({ ...prev, color: newValue }));
  };

  const handleSwatchPickerClose = () => {
    if (editingSwatch.isOpen) {
      const { type, index, color: finalColor } = editingSwatch;
      const configToUpdate = type === 'shades' ? color.shadesConfig : color.tintsConfig;
      const newPalette = [...configToUpdate.palette];
      newPalette[index] = chroma(finalColor).hex();
      onUpdate(color.id, { [`${type}Config`]: { ...configToUpdate, palette: newPalette } });
    }
    setEditingSwatch({ isOpen: false, anchorEl: null, color: null, index: null, format: 'HEX', type: null });
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
      className="bg-white border border-neutral-200 rounded-lg shadow-sm"
    >
      <div className="flex items-center gap-2 p-1.5 relative group/row">
        <button 
          className="w-8 h-8 rounded-md flex-shrink-0 border-2 border-neutral-300 transition-transform duration-200 hover:scale-110" 
          style={{ backgroundColor: colorSwatchValue }}
          onClick={(e) => setPickerState({ isOpen: true, anchorEl: e.currentTarget })}
        />
        
        <div className="flex items-center w-56 bg-white border border-neutral-300 rounded-md px-3 focus-within:border-brand transition-colors">
            <input 
                value={color.name}
                onChange={(e) => {
                    let nextName = e.target.value;
                    if (nextName && !nextName.startsWith('--')) {
                        nextName = `--${nextName.replace(/^--+/, '')}`;
                    }
                    onUpdate(color.id, { name: nextName || '--' });
                }}
                className="bg-transparent focus:outline-none py-1.5 text-neutral-800 flex-1 min-w-0"
                placeholder="--color-1"
            />
        </div>

        <input 
          value={displayedValue}
          onChange={(e) => onUpdate(color.id, { value: e.target.value })}
          onDoubleClick={handleCopy}
          className="flex-1 font-mono bg-white rounded-md px-3 py-1.5 text-sm text-neutral-700 border border-neutral-300 focus:outline-none focus:border-brand"
        />
        <div className="relative">
          <button 
            ref={formatButtonRef} // Attach ref to the button
            onClick={() => setFormatDropdownOpen(!isFormatDropdownOpen)}
            className="flex items-center justify-between w-24 px-3 py-1.5 text-sm bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
          >
            {color.format}
            <ChevronDown size={16} className="text-neutral-500" />
          </button>
          {/* The dropdown is no longer rendered here */}
        </div>
        <button 
            className="p-2 text-neutral-500 rounded-md hover:bg-neutral-100 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity" 
            onClick={() => onDelete(color.id)}
        >
          <Trash2 size={16} />
        </button>
        <button
            onClick={() => setExpanded(!isExpanded)}
            className="p-2 text-neutral-500 rounded-md hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        >
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} />
            </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ShadeTintGenerator 
              type="shades"
              format={color.format}
              config={{...color.shadesConfig, editingState: editingSwatch, setEditingState: setEditingSwatch}}
              onConfigChange={(newValues) => handleConfigChange('shades', newValues)}
            />
            <ShadeTintGenerator
              type="tints"
              format={color.format}
              config={{...color.tintsConfig, editingState: editingSwatch, setEditingState: setEditingSwatch}}
              onConfigChange={(newValues) => handleConfigChange('tints', newValues)}
            />
            <div className="bg-white p-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Layers size={16} className="text-neutral-400" />
                        <h4 className="text-sm font-medium text-neutral-700">Generate Transparent Variants</h4>
                    </div>
                    <Switch 
                        enabled={color.transparentConfig.enabled} 
                        setEnabled={(enabled) => handleConfigChange('transparent', { enabled })} 
                    />
                </div>
            </div>
            
            <UtilityClassGenerator 
                config={color.utilityConfig}
                onConfigChange={(newConfig) => onUpdate(color.id, { utilityConfig: newConfig })}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* The popover and dropdown are now rendered at the end */}
      <ColorPickerPopover
        isOpen={pickerState.isOpen}
        anchorEl={pickerState.anchorEl}
        onClose={() => setPickerState({ isOpen: false, anchorEl: null })}
        color={color.value}
        format={color.format}
        onChange={handleValueChange}
      />
      
      <ColorPickerPopover
        isOpen={editingSwatch.isOpen}
        anchorEl={editingSwatch.anchorEl}
        onClose={handleSwatchPickerClose}
        color={editingSwatch.color}
        format={editingSwatch.format}
        onChange={handleSwatchPickerChange}
      />

      <FormatDropdown
        isOpen={isFormatDropdownOpen}
        anchorEl={formatButtonRef.current}
        onClose={() => setFormatDropdownOpen(false)}
        onFormatSelect={handleFormatChange}
      />
    </motion.div>
  );
};

export default ColorRow;