// src/components/spacing/SpacingSidebar.jsx
import React from 'react';
import ValueStepper from '../ui/ValueStepper';
import Select from '../ui/Select';
import RatioSlider from '../ui/RatioSlider';
import { Type, Scaling, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

const SpacingSidebar = ({ settings, onSettingsChange, scaleOptions }) => {

  const dynamicBaseIndexOptions = (scaleOptions || []).map(item => ({
    label: item.id,
    value: item.id,
  }));

  return (
    <aside className="sticky top-0 h-screen w-80 bg-black border-r border-neutral-900 p-8 flex flex-col gap-10 shrink-0">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-2xl font-bold text-white tracking-tight">Spacing Scale</h3>
        <p className="text-sm text-neutral-400 mt-1">Define your fluid, responsive spacing system.</p>
      </motion.header>

      <div className="flex flex-col gap-8">
        
        <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
          <label className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
            <Type size={14} />
            Naming Convention
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 select-none pointer-events-none">--</span>
            <input
              type="text"
              value={settings.namingConvention}
              onChange={(e) => onSettingsChange({ ...settings, namingConvention: e.target.value.replace(/[^a-zA-Z0-9-]/g, '') })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-7 pr-3 py-2 text-base text-neutral-200 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </motion.div>

        <motion.div 
          custom={2} 
          initial="hidden" 
          animate="visible" 
          variants={sectionVariants}
          className="border border-neutral-800 rounded-xl p-6 flex flex-col gap-6"
        >
          <div className="flex items-center gap-3">
            <Scaling size={16} className="text-neutral-300"/>
            <h4 className="font-semibold text-white">Scale Engine</h4>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Base Scale</label>
              <Select
                  options={dynamicBaseIndexOptions}
                  selected={settings.baseScaleIndex}
                  onSelect={(val) => onSettingsChange({ ...settings, baseScaleIndex: val })}
              />
            </div>
            
            {/* ** THE CHANGE: Min and Max size are now on their own beautiful rows ** */}
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-1.5">
                <Smartphone size={14} />
                Min Size (Mobile)
              </label>
              <ValueStepper
                  value={settings.minSize}
                  onValueChange={(val) => onSettingsChange({ ...settings, minSize: val })}
                  unit="px"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-1.5">
                <Monitor size={14} />
                Max Size (Desktop)
              </label>
              <ValueStepper
                  value={settings.maxSize}
                  onValueChange={(val) => onSettingsChange({ ...settings, maxSize: val })}
                  unit="px"
              />
            </div>
            
            <RatioSlider
                label="Min Scale Ratio"
                value={settings.minScaleRatio}
                onValueChange={(val) => onSettingsChange({ ...settings, minScaleRatio: val })}
            />
            <RatioSlider
                label="Max Scale Ratio"
                value={settings.maxScaleRatio}
                onValueChange={(val) => onSettingsChange({ ...settings, maxScaleRatio: val })}
            />
          </div>
        </motion.div>
      </div>
    </aside>
  );
};

export default SpacingSidebar;