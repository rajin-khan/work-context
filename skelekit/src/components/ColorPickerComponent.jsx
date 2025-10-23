// src/components/ColorPickerComponent.jsx
import React from 'react';
import { CustomPicker } from 'react-color';
import { Saturation, Hue, Alpha } from 'react-color/lib/components/common';
import CustomSlider from './ui/CustomSlider';

// ** THIS IS THE CHANGE: Added onChangeComplete to props **
const CustomColorPicker = ({ rgb, hsl, hsv, onChange, onChangeComplete, format }) => {
  const showRgbSliders = ['HEX', 'HEXA', 'RGB', 'RGBA'].includes(format.toUpperCase());
  const showHslSliders = ['HSL', 'HSLA'].includes(format.toUpperCase());
  const showAlphaSlider = ['HEXA', 'RGBA', 'HSLA'].includes(format.toUpperCase());

  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: Number(value) };
    onChange(newRgb);
  };

  const handleHslChange = (channel, value) => {
    const newHsl = { 
      ...hsl, 
      [channel]: channel === 'h' ? Number(value) : Number(value) / 100 
    };
    onChange(newHsl);
  };
  
  // ** THIS IS THE CHANGE: Trigger onChangeComplete on mouse up for sliders **
  const handleSliderMouseUp = () => {
    if (onChangeComplete) {
      onChangeComplete();
    }
  }

  const sliderTrackStyles = {
    red: { background: `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))` },
    green: { background: `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))` },
    blue: { background: `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))` },
    hue: { background: `linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`},
    saturation: { background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l * 100}%), hsl(${hsl.h}, 100%, ${hsl.l * 100}%))`},
    lightness: { background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s * 100}%, 0%), hsl(${hsl.h}, ${hsl.s * 100}%, 50%), hsl(${hsl.h}, ${hsl.s * 100}%, 100%))`},
  };

  const DraggablePointer = () => (
    <div 
      className="w-4 h-4 rounded-full bg-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
      style={{ boxShadow: '0 0 0 1.5px rgba(0, 0, 0, 0.5)' }}
    />
  );
  
  const SaturationPointer = () => (
    <div className="w-5 h-5 rounded-full bg-transparent border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2" />
  );

  const reactColorSliderStyle = {
    height: '10px',
    borderRadius: '9999px',
  };

  return (
    <div className="w-[280px] p-4 bg-white rounded-lg border border-neutral-300 shadow-2xl flex flex-col gap-4">
      <div className="relative w-full h-48 rounded-md overflow-hidden">
        {/* ** THIS IS THE CHANGE: Added onChangeComplete passthrough ** */}
        <Saturation hsl={hsl} hsv={hsv} onChange={onChange} onChangeComplete={onChangeComplete} pointer={SaturationPointer} />
      </div>
      
      <div className="flex flex-col gap-3">

        {!showHslSliders && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-neutral-600 font-medium px-1">Hue</label>
            <div className="relative w-full h-4 flex items-center">
              {/* ** THIS IS THE CHANGE: Added onChangeComplete passthrough ** */}
              <Hue hsl={hsl} onChange={onChange} onChangeComplete={onChangeComplete} direction="horizontal" pointer={DraggablePointer} style={reactColorSliderStyle} />
            </div>
          </div>
        )}

        {showAlphaSlider && (
           <div className="flex flex-col gap-1.5">
            <label className="text-xs text-neutral-600 font-medium px-1">Alpha</label>
            <div className="relative w-full h-4 flex items-center">
              {/* ** THIS IS THE CHANGE: Added onChangeComplete passthrough ** */}
              <Alpha rgb={rgb} hsl={hsl} onChange={onChange} onChangeComplete={onChangeComplete} pointer={DraggablePointer} style={reactColorSliderStyle} />
            </div>
           </div>
        )}

        {showRgbSliders && (
          <div className="flex flex-col gap-3 pt-1">
            {/* ** THIS IS THE CHANGE: Added onMouseUp handlers ** */}
            <CustomSlider label="Red" value={rgb.r} max="255" onChange={(e) => handleRgbChange('r', e.target.value)} onMouseUp={handleSliderMouseUp} style={sliderTrackStyles.red} />
            <CustomSlider label="Green" value={rgb.g} max="255" onChange={(e) => handleRgbChange('g', e.target.value)} onMouseUp={handleSliderMouseUp} style={sliderTrackStyles.green} />
            <CustomSlider label="Blue" value={rgb.b} max="255" onChange={(e) => handleRgbChange('b', e.target.value)} onMouseUp={handleSliderMouseUp} style={sliderTrackStyles.blue} />
          </div>
        )}

        {showHslSliders && (
          <div className="flex flex-col gap-3 pt-1">
            {/* ** THIS IS THE CHANGE: Added onMouseUp handlers ** */}
            <CustomSlider label="Hue" value={Math.round(hsl.h)} max="360" onChange={(e) => handleHslChange('h', e.target.value)} onMouseUp={handleSliderMouseUp} style={sliderTrackStyles.hue} />
            <CustomSlider label="Saturation" value={Math.round(hsl.s * 100)} max="100" onChange={(e) => handleHslChange('s', e.target.value)} onMouseUp={handleSliderMouseUp} style={sliderTrackStyles.saturation} />
            <CustomSlider label="Lightness" value={Math.round(hsl.l * 100)} max="100" onChange={(e) => handleHslChange('l', e.target.value)} onMouseUp={handleSliderMouseUp} style={sliderTrackStyles.lightness} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPicker(CustomColorPicker);