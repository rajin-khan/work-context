// src/components/ui/CustomSlider.jsx
import React from 'react';

const CustomSlider = ({
  label,
  value,
  max,
  onChange,
  onMouseUp,
  style,
  variant = 'default',
}) => {
  const isColorPickerSlider = variant === 'color-picker';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-neutral-600 font-medium px-1">{label}</label>
      <div 
        className={`w-full rounded-full relative flex items-center ${
          isColorPickerSlider ? 'h-4' : 'h-[10px]'
        }`}
        style={style}
      >
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={onChange}
          onMouseUp={onMouseUp}
          className={`range-slider w-full ${
            isColorPickerSlider ? 'range-slider-color-picker' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default CustomSlider;
