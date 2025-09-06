// src/components/ui/CustomSlider.jsx
import React from 'react';

const CustomSlider = ({ label, value, max, onChange, style }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-neutral-400 font-medium px-1">{label}</label>
      <div 
        className="w-full h-[10px] rounded-full relative flex items-center" 
        style={style}
      >
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={onChange}
          className="range-slider w-full"
        />
      </div>
    </div>
  );
};

export default CustomSlider;