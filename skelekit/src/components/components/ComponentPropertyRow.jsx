// src/components/components/ComponentPropertyRow.jsx
import React from 'react';
import { X } from 'lucide-react';
import EditablePill from '../ui/EditablePill';

// THE FIX IS HERE: Accept `item` and `valueOptions` as props
const ComponentPropertyRow = ({ item, onUpdate, onRemove, propertyOptions, valueOptions }) => {
  const { prop, value } = item;

  return (
    <div className="flex items-center gap-3 group px-4 py-1 hover:bg-neutral-100/50 rounded-md">
      {/* Property Input */}
      <div className="w-48">
        <EditablePill
          value={prop}
          // THE FIX IS HERE: Update the specific 'prop' field of the item
          onChange={(newProp) => onUpdate({ ...item, prop: newProp })}
          placeholder="property"
          datalistId="component-css-properties"
          options={propertyOptions}
          inputClassName="w-full"
        />
      </div>

      <span className="text-neutral-600">:</span>

      {/* Value Input */}
      <div className="flex-1">
        <EditablePill
          value={value}
          // THE FIX IS HERE: Update the specific 'value' field of the item
          onChange={(newValue) => onUpdate({ ...item, value: newValue })}
          placeholder="value"
          datalistId="component-css-values"
          options={valueOptions}
          inputClassName="w-full"
        />
      </div>

      <button onClick={onRemove} className="text-neutral-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export default ComponentPropertyRow;