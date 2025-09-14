// src/components/ui/ValueStepper.jsx
import React from 'react';
import { Plus, Minus } from 'lucide-react';

const ValueStepper = ({ value, onValueChange, min = 0, max = Infinity, step = 1, unit = '' }) => {
  const handleIncrement = () => {
    onValueChange(Math.min(max, value + step));
  };
  const handleDecrement = () => {
    onValueChange(Math.max(min, value - step));
  };
  const handleChange = (e) => {
    const numValue = e.target.value === '' ? '' : Number(e.target.value);
    if (numValue === '' || (numValue >= min && numValue <= max)) {
      onValueChange(numValue);
    }
  };
  const handleBlur = (e) => { if (e.target.value === '') onValueChange(min); }

  return (
    // ** THE CHANGE: Replaced `focus-within:border-brand` with a neutral color **
    <div className="flex items-center justify-between w-full bg-neutral-900 border border-neutral-800 rounded-md focus-within:border-neutral-600 transition-colors">
      <input
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        className="bg-transparent focus:outline-none py-1.5 px-3 text-neutral-200 w-full"
      />
      <div className="flex items-center h-full pr-1">
        {unit && <span className="text-sm text-neutral-500 mr-2 select-none">{unit}</span>}
        <div className="flex flex-col items-center">
          <button onClick={handleIncrement} className="text-neutral-400 hover:text-white transition-colors h-1/2 px-1 flex items-center justify-center">
            <Plus size={14} />
          </button>
          <button onClick={handleDecrement} className="text-neutral-400 hover:text-white transition-colors h-1/2 px-1 flex items-center justify-center">
            <Minus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValueStepper;