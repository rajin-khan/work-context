// src/components/components/InitialComponentView.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const InitialComponentView = ({ onAddClick }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <button
        onClick={onAddClick}
        className="w-48 h-48 bg-white border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center text-neutral-600 hover:border-neutral-400 hover:text-neutral-500 transition-all duration-300"
      >
        <Plus size={48} />
      </button>
    </div>
  );
};

export default InitialComponentView;