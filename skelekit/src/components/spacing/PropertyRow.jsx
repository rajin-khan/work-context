// src/components/spacing/PropertyRow.jsx
import React from 'react';
import { X } from 'lucide-react';
import EditablePill from '../ui/EditablePill';

const PropertyRow = ({ property, onUpdate, onRemove, spacingVariableOptions, propertyOptions }) => {
  return (
    <div className="flex items-center gap-3 group">
      {/* Property Input */}
      <div className="w-48">
        <EditablePill
          value={property.property}
          onChange={(prop) => onUpdate({ ...property, property: prop })}
          placeholder="property"
          datalistId="css-properties"
          options={propertyOptions}
          inputClassName="w-full"
        />
      </div>

      <span className="text-neutral-700">:</span>

      {/* Value Input */}
      <div className="w-56">
        <EditablePill
          value={property.value}
          onChange={(val) => onUpdate({ ...property, value: val })}
          placeholder="value"
          datalistId="spacing-variables"
          options={spacingVariableOptions}
          inputClassName="w-full"
        />
      </div>
      
      <div className="flex-1"></div>

      <button onClick={onRemove} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export default PropertyRow;