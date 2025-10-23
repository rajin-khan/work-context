// src/components/ui/RatioSlider.jsx
import React, { useState, useEffect } from 'react'; // Import React hooks
import { Plus, Minus } from 'lucide-react';

const RatioSlider = ({ label, value, onValueChange }) => {
  const min = 1;
  const max = 2;
  const step = 0.05;

  // ** NEW: Local state for the input field to allow for smooth, unrestricted typing **
  const [inputValue, setInputValue] = useState(value.toFixed(2));

  // ** NEW: This effect syncs the local input's value when the parent state changes (e.g., from the slider) **
  useEffect(() => {
    // We check if the values are different to prevent the cursor from jumping while typing.
    if (parseFloat(inputValue) !== value) {
      setInputValue(value.toFixed(2));
    }
  }, [value]);

  const handleIncrement = () => {
    onValueChange(parseFloat(Math.min(max, value + step).toFixed(2)));
  };

  const handleDecrement = () => {
    onValueChange(parseFloat(Math.max(min, value - step).toFixed(2)));
  };

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setInputValue(newValue.toFixed(2)); // Keep the input field in sync with the slider.
    onValueChange(newValue);
  };

  // ** NEW: A handler for when the user types in the input field **
  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update the local state freely.
  };

  // ** NEW: This is the key. When the user clicks away, we validate and clamp the input **
  const handleInputBlur = () => {
    let numValue = parseFloat(inputValue);

    // If the input is empty or not a number, default it to 1.
    if (isNaN(numValue)) {
      numValue = 1;
    }

    // Clamp the final value between 1 and 2.
    const clampedValue = Math.max(min, Math.min(max, numValue));
    
    // Update the parent state and format the input field with the clean, clamped value.
    onValueChange(clampedValue);
    setInputValue(clampedValue.toFixed(2));
  };
  
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger the blur event to validate and save
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-neutral-600 mb-2 block">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-neutral-300 rounded-md px-3 py-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            className="range-slider w-full"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-lg p-0.5">
          <button onClick={handleDecrement} className="p-1 text-neutral-600 hover:text-neutral-800 transition-colors rounded-md hover:bg-neutral-100">
            <Minus size={14} />
          </button>
          
          {/* ** THE CHANGE: The span is now a fully functional, controlled input ** */}
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="text-sm font-mono text-neutral-700 w-12 text-center bg-transparent focus:outline-none"
            step="0.01"
            min="1"
            max="2"
          />

          <button onClick={handleIncrement} className="p-1 text-neutral-600 hover:text-neutral-800 transition-colors rounded-md hover:bg-neutral-100">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatioSlider;