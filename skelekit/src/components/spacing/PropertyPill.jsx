// src/components/spacing/PropertyPill.jsx
import React from 'react';
import EditableProperty from '../ui/EditableProperty';
import { X } from 'lucide-react';

const PropertyPill = ({ value, onChange, onRemove, startInEditMode, onEditComplete }) => {
  return (
    <div className="flex items-center gap-1.5 bg-white group border border-transparent rounded-full pl-3 pr-2 py-1 hover:border-neutral-300 transition-colors">
      <EditableProperty 
        value={value}
        onChange={onChange}
        startInEditMode={startInEditMode}
        onEditComplete={onEditComplete}
      />
      <button 
        onClick={onRemove}
        className="text-neutral-500 hover:text-red-500 opacity-50 group-hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default PropertyPill;