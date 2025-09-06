// src/components/ColorGroup.jsx
import React, { useState, useRef, useCallback } from 'react';
import { Plus, MoreVertical, Sparkles } from 'lucide-react';
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

const ColorGroup = () => {
  const [groupName, setGroupName] = useState('Untitled');
  const [colors, setColors] = useState([]);
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

  const addSuggestedColor = () => {
    const newColor = {
      id: generateId(),
      name: `--color-${colors.length + 1}`,
      value: getNextBrewerColor(),
      format: 'HEX',
    };
    setColors([...colors, newColor]);
  };

  const addDefaultColor = () => {
    const newColor = {
      id: generateId(),
      name: `--color-${colors.length + 1}`,
      value: '#808080',
      format: 'HEX',
    };
    setColors([...colors, newColor]);
  }

  const updateColor = (id, newProps) => {
    if (!hasBeenEdited) {
      setHasBeenEdited(true);
    }
    setColors(colors.map(c => c.id === id ? { ...c, ...newProps } : c));
  };

  const deleteColor = (id) => {
    setColors(colors.filter(c => c.id !== id));
  };

  const handleCreateGroup = () => {
    const firstColor = {
      id: generateId(),
      name: '--primary-500',
      value: getNextBrewerColor(),
      format: 'HEX',
    };
    setColors([firstColor]);
  };

  if (colors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-neutral-950 border border-neutral-900 p-8 rounded-lg max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-white mb-2">No color groups</h2>
          <p className="text-sm text-neutral-400 mb-6">Add a color group to get started.</p>
          <button onClick={handleCreateGroup} className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:bg-neutral-800 transition-colors">
            <Plus size={16} className="mr-2" />
            Create new color group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="text-2xl font-bold bg-transparent focus:outline-none focus:bg-neutral-900 rounded px-2 -mx-2 transition-colors"
        />
        <button className="p-2 text-neutral-500 rounded-md hover:bg-neutral-900 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {colors.map((color) => (
            <ColorRow key={color.id} color={color} onUpdate={updateColor} onDelete={deleteColor} />
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
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
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 shadow-[0_0_10px_rgba(147,51,234,0.2)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:border-brand/50 hover:bg-neutral-800 hover:text-white transition-all duration-300"
                >
                  <motion.div
                    className="mr-2"
                    animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "mirror", ease: 'easeInOut' }}
                  >
                    {/* ** THIS IS THE CHANGE: text-orange-400 is now text-neutral-200 ** */}
                    <Sparkles size={16} className="text-neutral-200" />
                  </motion.div>
                  <span>Suggest Color</span>
                </button>
                <div className="absolute bottom-full mb-2 w-64 left-1/2 -translate-x-1/2 bg-neutral-800 text-neutral-300 text-xs text-center rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  SkeleKit will suggest a new color from a curated, professionally-designed palette.
                </div>
              </div>
              <button 
                onClick={addDefaultColor} 
                className="p-2 bg-neutral-950 border border-neutral-900 rounded-md text-neutral-400 hover:text-white hover:border-neutral-700 transition-all"
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
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-neutral-950 border border-neutral-900 rounded-md text-neutral-400 hover:text-white hover:border-neutral-700 transition-all"
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