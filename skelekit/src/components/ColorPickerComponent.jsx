// src/components/ColorPickerComponent.jsx
import React from 'react';
import { RgbaStringColorPicker, RgbStringColorPicker, HslaStringColorPicker, HslStringColorPicker, HexColorPicker } from "react-colorful";
import { colord } from 'colord';

// This map ensures the correct color string format is passed to each picker component
const formatToConverter = {
  HEX: (c) => c.toHex(),
  HEXA: (c) => c.toHex(), // HexColorPicker handles both
  RGB: (c) => c.toRgbString(),
  RGBA: (c) => c.toRgbaString(),
  HSL: (c) => c.toHslString(),
  HSLA: (c) => c.toHslString(), // HslStringColorPicker handles both
};

const ColorPickerComponent = ({ color, onChange, format }) => {
  const pickerStyle = {
    width: '260px',
    padding: '16px',
    borderRadius: '8px',
    background: '#171717', // neutral-900
    border: '1px solid #262626', // neutral-800
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
  };

  const customStyles = `
    .react-colorful { gap: 12px; }
    .react-colorful__saturation { border-radius: 6px; border-bottom: 1px solid #262626; }
    .react-colorful__hue, .react-colorful__alpha { height: 16px; border-radius: 99px; }
    .react-colorful__hue .react-colorful__pointer, .react-colorful__alpha .react-colorful__pointer { width: 16px; height: 16px; border-width: 3px; }
    .react-colorful__saturation-pointer { width: 22px; height: 22px; border-width: 3px; }
  `;

  // Get the correct conversion function, defaulting to hex
  const converter = formatToConverter[format.toUpperCase()] || formatToConverter.HEX;
  const convertedColor = converter(colord(color));

  const renderPicker = () => {
    switch (format.toUpperCase()) {
      case 'RGB': return <RgbStringColorPicker style={pickerStyle} color={convertedColor} onChange={onChange} />;
      case 'RGBA': return <RgbaStringColorPicker style={pickerStyle} color={convertedColor} onChange={onChange} />;
      case 'HSL': return <HslStringColorPicker style={pickerStyle} color={convertedColor} onChange={onChange} />;
      case 'HSLA': return <HslaStringColorPicker style={pickerStyle} color={convertedColor} onChange={onChange} />;
      case 'HEX':
      case 'HEXA':
      default: return <HexColorPicker style={pickerStyle} color={convertedColor} onChange={onChange} />;
    }
  };

  return (
    <>
      <style>{customStyles}</style>
      <div>{renderPicker()}</div>
    </>
  );
};

export default ColorPickerComponent;