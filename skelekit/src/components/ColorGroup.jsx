// src/components/ColorGroup.jsx
import React, { useState, useRef } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorRow from './ColorRow';
import chroma from 'chroma-js';

const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

const curatedBrewerPalettes = [
  'Set2', 'Accent', 'Paired', 'Pastel1', 'Dark2', 'Set1', 'Pastel2', 'Set3',
  'OrRd', 'PuBu', 'BuPu', 'Oranges', 'BuGn', 'YlOrBr', 'YlGn', 'Reds', 'RdPu',
  'Greens', 'YlGnBu', 'Purples', 'GnBu', 'Greys', 'YlOrRd', 'PuRd', 'Blues', 'PuBuGn',
  'Spectral', 'RdYlGn', 'RdBu', 'PiYG', 'PRGn', 'RdYlBu', 'BrBG', 'RdGy', 'PuOr'
];

const getRandomPaletteSource = (exclude) => {
  let paletteName = exclude;
  while (paletteName === exclude) {
    paletteName = curatedBrewerPalettes[Math.floor(Math.random() * curatedBrewerPalettes.length)];
  }
  return {
    name: paletteName,
    colors: chroma.brewer[paletteName],
    currentIndex: 0,
  };
};

const defaultShadeTintConfig = { enabled: false, count: 8, palette: [] };

const ColorGroup = ({ group, onUpdateGroup, onRemoveGroup }) => {
  const paletteSourceRef = useRef(getRandomPaletteSource(null));
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  const getNextBrewerColor = () => {
    let source = paletteSourceRef.current;
    if (source.currentIndex >= source.colors.length) {
      paletteSourceRef.current = getRandomPaletteSource(source.name);
      source = paletteSourceRef.current;
    }
    const colorToReturn = source.colors[source.currentIndex];
    paletteSourceRef.current.currentIndex += 1;
    return colorToReturn;
  };

  const createNewColor = (props) => ({
    id: generateId(),
    name: `--color-${group.colors.length + 1}`,
    value: '#808080',
    format: 'HEX',
    shadesConfig: { ...defaultShadeTintConfig },
    tintsConfig: { ...defaultShadeTintConfig },
    transparentConfig: { enabled: false },
    utilityConfig: { text: false, background: false, border: false, fill: false },
    ...props,
  });
  
  const setColors = (newColors) => {
    onUpdateGroup(group.id, { colors: newColors });
  };

  const addSuggestedColor = () => {
    const newColor = createNewColor({ value: getNextBrewerColor() });
    setColors([...group.colors, newColor]);
  };

  const addDefaultColor = () => {
    // THIS IS THE FIX: Set hasBeenEdited to true
    if (!hasBeenEdited) setHasBeenEdited(true);
    const newColor = createNewColor({});
    setColors([...group.colors, newColor]);
  }

  const updateColor = (id, newProps) => {
    // This correctly sets the edited flag on any change
    if (!hasBeenEdited) setHasBeenEdited(true);
    setColors(group.colors.map(c => c.id === id ? { ...c, ...newProps } : c));
  };

  const deleteColor = (id) => {
    // THIS IS THE FIX: Set hasBeenEdited to true
    if (!hasBeenEdited) setHasBeenEdited(true);
    setColors(group.colors.filter(c => c.id !== id));
  };

  return (
    <div className="relative bg-white border border-neutral-300 rounded-xl shadow-2xl overflow-hidden p-6 group/group">
        <button 
          onClick={() => onRemoveGroup(group.id)}
          className="absolute top-5 right-5 p-1.5 text-neutral-500 rounded-full hover:bg-neutral-100 hover:text-red-500 opacity-0 group-hover/group:opacity-100 transition-all z-10"
          aria-label="Remove color group"
        >
          <X size={18} />
        </button>
        <header className="flex items-center justify-between mb-6">
          <input
            type="text"
            value={group.name}
            onChange={(e) => onUpdateGroup(group.id, { name: e.target.value })}
            className="text-2xl font-bold text-neutral-800 tracking-tight bg-transparent focus:outline-none focus:bg-neutral-100 rounded px-2 -mx-2"
          />
        </header>
      
      <div className="space-y-2">
        <AnimatePresence>
          {group.colors.map((color) => (
            <ColorRow key={color.id} color={color} onUpdate={updateColor} onDelete={deleteColor} />
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* THIS IS THE FIX: The condition is now just !hasBeenEdited */}
          {!hasBeenEdited ? (
            <motion.div
              key="suggestion-buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-2"
            >
              <div className="relative group">
                <button 
                  onClick={addSuggestedColor} 
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-white border border-neutral-300 rounded-md text-neutral-700 shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:border-brand/50 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-300"
                >
                  <motion.div
                    className="mr-2"
                    animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "mirror", ease: 'easeInOut' }}
                  >
                    <Sparkles size={16} className="text-neutral-700" />
                  </motion.div>
                  <span>Suggest Color</span>
                </button>
                <div className="absolute bottom-full mb-2 w-64 left-1/2 -translate-x-1/2 bg-white text-neutral-700 text-xs text-center rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  SkeleKit will suggest a new color from a curated, professionally-designed palette.
                </div>
              </div>
              <button 
                onClick={addDefaultColor} 
                className="p-2 bg-white border border-neutral-300 rounded-md text-neutral-600 hover:text-neutral-800 hover:border-neutral-400 transition-all"
                aria-label="Add default color"
              >
                <Plus size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="default-button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <button 
                onClick={addDefaultColor} 
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-white border border-neutral-300 rounded-md text-neutral-600 hover:text-neutral-800 hover:border-neutral-400 transition-all"
              >
                <Plus size={16} className="mr-2" />
                Create new color
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ColorGroup;