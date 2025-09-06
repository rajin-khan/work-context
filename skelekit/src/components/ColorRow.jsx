// src/components/ColorRow.jsx
import React, { useState, useRef, useEffect } from 'react';
import { colord } from 'colord';
import chroma from 'chroma-js';
import { ChevronDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPickerPopover from './ColorPickerPopover';
import ShadeTintGenerator from './ShadeTintGenerator';
import toast from 'react-hot-toast';

const formats = ['HEX', 'HEXA', 'RGB', 'RGBA', 'HSL', 'HSLA'];

const generatePalette = (baseColor, count, type) => {
    try {
        const baseChroma = chroma(baseColor);
        const baseLch = baseChroma.lch();
        let endColor;

        if (type === 'shades') {
            const endL = Math.max(8, baseLch[0] - 75);
            const endC = baseLch[1] + 15;
            endColor = chroma.lch(endL, endC, baseLch[2]);
        } else {
            const endL = Math.min(96, baseLch[0] + (100 - baseLch[0]) * 0.95);
            const endC = baseLch[1] * 0.1;
            endColor = chroma.lch(endL, endC, baseLch[2]);
        }
        return chroma.scale([baseColor, endColor]).mode('lch').colors(count);
    } catch (e) {
        console.error("Error generating palette:", e);
        return [];
    }
};

const ColorRow = ({ color, onUpdate, onDelete }) => {
  const [pickerState, setPickerState] = useState({ isOpen: false, anchorEl: null });
  const [isFormatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const formatDropdownRef = useRef(null);

  const [shadesConfig, setShadesConfig] = useState({ enabled: false, count: 8, palette: [] });
  const [tintsConfig, setTintsConfig] = useState({ enabled: false, count: 8, palette: [] });
  const [editingSwatch, setEditingSwatch] = useState({ isOpen: false, anchorEl: null, color: null, index: null, format: 'HEX', type: null });

  useEffect(() => {
    if (shadesConfig.enabled) {
      setShadesConfig(prev => ({...prev, palette: generatePalette(color.value, prev.count, 'shades')}));
    }
    if (tintsConfig.enabled) {
      setTintsConfig(prev => ({...prev, palette: generatePalette(color.value, prev.count, 'tints')}));
    }
  }, [color.value]);
  
  const handleConfigChange = (type, newValues) => {
    const setConfig = type === 'shades' ? setShadesConfig : setTintsConfig;
    const currentConfig = type === 'shades' ? shadesConfig : tintsConfig;

    setConfig(prevConfig => {
        const newConfig = { ...prevConfig, ...newValues };
        
        const justEnabled = newValues.enabled && !currentConfig.enabled;
        const countChanged = newValues.count && newValues.count !== currentConfig.count;

        if (justEnabled || (newConfig.enabled && countChanged)) {
            newConfig.palette = generatePalette(color.value, newConfig.count, type);
        } else if (newValues.enabled === false) {
            newConfig.palette = [];
        }

        return newConfig;
    });
  };

  const handleValueChange = (colorResult) => {
    const { r, g, b, a } = colorResult.rgb;
    const newValue = `rgba(${r}, ${g}, ${b}, ${a})`;
    onUpdate(color.id, { value: newValue });
    setPickerState(prev => ({ ...prev, color: newValue }));
  };

  const handleFormatChange = (newFormat) => {
    onUpdate(color.id, { format: newFormat });
    setFormatDropdownOpen(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(displayedValue);
    toast.success('Color copied to clipboard!');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target)) {
        setFormatDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formatDropdownRef]);

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
      const setConfig = type === 'shades' ? setShadesConfig : setTintsConfig;
      setConfig(prevConfig => {
        const newPalette = [...prevConfig.palette];
        newPalette[index] = chroma(finalColor).hex();
        return { ...prevConfig, palette: newPalette };
      });
    }
    setEditingSwatch({ isOpen: false, anchorEl: null, color: null, index: null, format: 'HEX', type: null });
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
      className="bg-neutral-950 border border-neutral-900 rounded-lg shadow-sm"
    >
      <div className="flex items-center gap-2 p-1.5 relative group/row">
        <button 
          className="w-8 h-8 rounded-md flex-shrink-0 border-2 border-neutral-800 transition-transform duration-200 hover:scale-110" 
          style={{ backgroundColor: colorSwatchValue }}
          onClick={(e) => setPickerState({ isOpen: true, anchorEl: e.currentTarget })}
        />
        
        {/* ** THIS IS THE FIX: A properly styled container for the prefix and input ** */}
        <div className="flex items-center w-56 bg-neutral-900 border border-neutral-800 rounded-md px-3 focus-within:border-brand transition-colors">
            <span className="text-neutral-500 select-none">--</span>
            <input 
                value={color.name.startsWith('--') ? color.name.slice(2) : color.name}
                onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                    onUpdate(color.id, { name: `--${sanitizedValue}` });
                }}
                className="bg-transparent focus:outline-none py-1.5 text-neutral-200 flex-1 pl-1 min-w-0"
                placeholder="variable-name"
            />
        </div>

        <input 
          value={displayedValue}
          onChange={(e) => onUpdate(color.id, { value: e.target.value })}
          onDoubleClick={handleCopy}
          className="flex-1 font-mono bg-neutral-900 rounded-md px-3 py-1.5 text-sm text-neutral-300 border border-neutral-800 focus:outline-none focus:border-brand"
        />
        <div className="relative" ref={formatDropdownRef}>
          <button 
            onClick={() => setFormatDropdownOpen(!isFormatDropdownOpen)}
            className="flex items-center justify-between w-24 px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 rounded-md hover:bg-neutral-800 transition-colors"
          >
            {color.format}
            <ChevronDown size={16} className="text-neutral-500" />
          </button>
          <AnimatePresence>
            {isFormatDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-30 w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg overflow-hidden"
              >
                {formats.map(f => (
                  <a key={f} href="#" onClick={(e) => { e.preventDefault(); handleFormatChange(f); }} className="block px-3 py-2 text-sm text-neutral-300 hover:bg-brand hover:text-white">
                    {f}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button 
            className="p-2 text-neutral-600 rounded-md hover:bg-neutral-800 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity" 
            onClick={() => onDelete(color.id)}
        >
          <Trash2 size={16} />
        </button>
        <button
            onClick={() => setExpanded(!isExpanded)}
            className="p-2 text-neutral-500 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
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
              baseColor={color.value}
              format={color.format}
              config={{...shadesConfig, editingState: editingSwatch, setEditingState: setEditingSwatch}}
              onConfigChange={(newValues) => handleConfigChange('shades', newValues)}
            />
            <ShadeTintGenerator
              type="tints"
              baseColor={color.value}
              format={color.format}
              config={{...tintsConfig, editingState: editingSwatch, setEditingState: setEditingSwatch}}
              onConfigChange={(newValues) => handleConfigChange('tints', newValues)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <ColorPickerPopover
        isOpen={pickerState.isOpen}
        anchorEl={pickerState.anchorEl}
        onClose={() => setPickerState({ isOpen: false, anchorEl: null })}
        color={color.value}
        format={color.format}
        onChange={handleValueChange}
        onChangeComplete={() => {}}
      />
      
      <ColorPickerPopover
        isOpen={editingSwatch.isOpen}
        anchorEl={editingSwatch.anchorEl}
        onClose={handleSwatchPickerClose}
        color={editingSwatch.color}
        format={editingSwatch.format}
        onChange={handleSwatchPickerChange}
        onChangeComplete={() => {}}
      />
    </motion.div>
  );
};

export default ColorRow;