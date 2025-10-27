// src/components/spacing/PropertyRow.jsx
import React from 'react';
import { X, Grid3x3, Code } from 'lucide-react';
import EditablePill from '../ui/EditablePill';

const PropertyRow = ({ property, onUpdate, onRemove, spacingVariableOptions, propertyOptions }) => {
  return (
    <div className="flex items-center gap-3 group/row">
      {/* Grid Icon */}
      <Grid3x3 size={15} className="text-neutral-400/70 flex-shrink-0" />
      
      {/* Property Name */}
      <div className="w-[140px] min-w-0 overflow-hidden">
        <EditablePill
          value={property.property}
          onChange={(prop) => onUpdate({ ...property, property: prop })}
          placeholder="property"
          datalistId="css-properties"
          options={propertyOptions}
          inputClassName="w-full"
          textColor="text-brand"
        />
      </div>

      <span className="text-neutral-400/70 text-base flex-shrink-0">:</span>

      {/* Code Icon */}
      <Code size={15} className="text-neutral-400/70 flex-shrink-0" />

      {/* Value */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <EditablePill
          value={property.value}
          onChange={(val) => onUpdate({ ...property, value: val })}
          placeholder="value"
          datalistId="spacing-variables"
          options={spacingVariableOptions}
          inputClassName="w-full"
        />
      </div>
      
      <button 
        onClick={onRemove} 
        className="opacity-0 group-hover/row:opacity-100 text-neutral-400 hover:text-red-500 transition-all flex-shrink-0 p-1.5 rounded hover:bg-red-50"
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default PropertyRow;