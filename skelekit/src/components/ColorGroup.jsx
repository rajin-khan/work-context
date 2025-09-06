// src/components/ColorGroup.jsx
import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorRow from './ColorRow';

const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

const initialColor = {
  id: generateId(),
  name: '--default-1',
  value: '#9333ea', // New brand color
  format: 'HEX',
};

const ColorGroup = () => {
  const [groupName, setGroupName] = useState('Untitled');
  const [colors, setColors] = useState([]);

  const addColor = () => {
    const newName = `--default-${colors.length + 1}`;
    setColors([...colors, { ...initialColor, id: generateId(), name: newName, value: '#d4d4d4' }]);
  };

  const updateColor = (id, newProps) => {
    setColors(colors.map(c => c.id === id ? { ...c, ...newProps } : c));
  };

  const deleteColor = (id) => {
    setColors(colors.filter(c => c.id !== id));
  };

  const handleCreateGroup = () => {
    setColors([initialColor]);
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
    // ** THIS IS THE CHANGE ** 
    // We give the container a max width and center it to allow rows to be longer.
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
      
      <div className="mt-4">
        <button onClick={addColor} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-neutral-950 border border-neutral-900 rounded-md text-neutral-400 hover:text-white hover:border-neutral-700 transition-all">
          <Plus size={16} className="mr-2" />
          Create new color
        </button>
      </div>
    </div>
  );
};

export default ColorGroup;