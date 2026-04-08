// src/components/ShadowGenerator.jsx
import React from 'react';
import Switch from './ui/Switch';
import { Droplet } from 'lucide-react';

const ShadowGenerator = ({ config, onConfigChange }) => {
  const handleEnableToggle = () => {
    onConfigChange({ enabled: !config.enabled });
  };

  return (
    <div className="bg-white p-4 border-t border-neutral-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplet size={16} className="text-neutral-500" />
          <h4 className="text-sm font-medium text-neutral-700">Generate Shadow Variants</h4>
        </div>
        <Switch enabled={config.enabled} setEnabled={handleEnableToggle} />
      </div>
      {config.enabled && (
        <p className="text-xs text-neutral-500 mt-2">
          Generates light and dark shadow colors (5% to 90% opacity) for use in shadows and effects.
        </p>
      )}
    </div>
  );
};

export default ShadowGenerator;


