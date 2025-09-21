// src/components/components/ComponentPropertyRow.jsx
import React from 'react';
import { X } from 'lucide-react';
import EditablePill from '../ui/EditablePill';
import { allCSSProperties } from '../../utils/cssProperties';

const propertyOptions = allCSSProperties.map(p => ({ label: p, value: p }));

const ComponentPropertyRow = ({ property, value, onUpdate, onRemove }) => {
  return (
    <div className="flex items-center gap-3 group px-4 py-1 hover:bg-neutral-800/50 rounded-md">
      {/* Property Input */}
      <div className="w-40">
        <EditablePill
          value={property}
          onChange={(newProp) => onUpdate(newProp, value)}
          placeholder="property"
          options={propertyOptions}
          inputClassName="w-full"
        />
      </div>

      <span className="text-neutral-700">:</span>

      {/* Value Input */}
      <div className="flex-1">
        <EditablePill
          value={value}
          onChange={(newValue) => onUpdate(property, newValue)}
          placeholder="value"
          options={[]} // We can add theme variables here later
          inputClassName="w-full"
        />
      </div>

      <button onClick={onRemove} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export default ComponentPropertyRow;