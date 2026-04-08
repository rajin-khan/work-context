// src/components/spacing/PropertyRow.jsx
import React from 'react';
import { X, Grid3x3, Code } from 'lucide-react';
import EditablePill from '../ui/EditablePill';

const PropertyRow = ({ property, onUpdate, onRemove, spacingVariableOptions, propertyOptions }) => {
  return (
    <div className="group/row flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Grid Icon */}
      <div className="flex items-center gap-3 sm:hidden">
        <Grid3x3 size={15} className="flex-shrink-0 text-neutral-400/70" />
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Property
        </span>
      </div>
      <Grid3x3 size={15} className="hidden flex-shrink-0 text-neutral-400/70 sm:block" />
      
      {/* Property Name */}
      <div className="min-w-0 overflow-hidden sm:w-[140px]">
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

      <span className="hidden flex-shrink-0 text-base text-neutral-400/70 sm:block">:</span>

      {/* Code Icon */}
      <div className="flex items-center gap-3 sm:hidden">
        <Code size={15} className="flex-shrink-0 text-neutral-400/70" />
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Value
        </span>
      </div>
      <Code size={15} className="hidden flex-shrink-0 text-neutral-400/70 sm:block" />

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
        className="self-end rounded-xl p-1.5 text-neutral-400 transition-all hover:bg-red-50 hover:text-red-500 sm:self-auto sm:opacity-0 sm:group-hover/row:opacity-100"
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default PropertyRow;
