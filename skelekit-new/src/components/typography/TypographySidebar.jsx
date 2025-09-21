// src/components/typography/TypographySidebar.jsx
import React from 'react';
import ValueStepper from '../ui/ValueStepper';
import Select from '../ui/Select';
import RatioSlider from '../ui/RatioSlider';
import { Type, Scaling, Smartphone, Monitor, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSpacingScale } from '../../utils/spacingCalculator';

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

const settingsPanelVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
};

const TypographySidebar = ({ groups, activeGroupId, onSelectGroup, onUpdateGroup, onUpdateGroupName, onRemoveGroup, onAddGroup }) => {
  
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const settings = activeGroup?.settings;
  const scaleOptions = settings ? generateSpacingScale(settings) : [];

  const dynamicBaseIndexOptions = (scaleOptions || []).map(item => ({
    label: item.id,
    value: item.id,
  }));
  
  const handleSettingsChange = (newValues) => {
      if(activeGroupId) {
          onUpdateGroup(activeGroupId, newValues);
      }
  }

  return (
    <aside className="sticky top-0 h-screen w-80 bg-black border-r border-neutral-900 flex flex-col shrink-0">
      <div className="p-4 border-b border-neutral-900">
         <div className="flex items-center gap-2 flex-wrap">
            {groups.map(group => (
                <button
                    key={group.id}
                    onClick={() => onSelectGroup(group.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeGroupId === group.id ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-900'
                    }`}
                >
                    {group.name}
                </button>
            ))}
             <button onClick={onAddGroup} className="p-2 text-neutral-400 hover:text-white transition-colors rounded-md hover:bg-neutral-800">
                <Plus size={16} />
             </button>
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <AnimatePresence mode="wait">
            {activeGroup && (
                <motion.div
                    key={activeGroupId}
                    variants={settingsPanelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
                    className="p-8 flex flex-col gap-10"
                >
                    <motion.header>
                         <input
                            type="text"
                            value={activeGroup.name}
                            onChange={(e) => onUpdateGroupName(activeGroupId, e.target.value)}
                            className="text-2xl font-bold text-white tracking-tight bg-transparent focus:outline-none focus:bg-neutral-900 rounded-md -mx-2 px-2 w-full"
                        />
                        <p className="text-sm text-neutral-400 mt-1">Define your fluid, responsive type system.</p>
                    </motion.header>

                    <div className="flex flex-col gap-8">
                        <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
                            <label className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2"><Type size={14} /> Naming Convention</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 select-none pointer-events-none">--</span>
                                <input type="text" value={settings.namingConvention} onChange={(e) => handleSettingsChange({ namingConvention: e.target.value.replace(/[^a-zA-Z0-9-]/g, '') })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-7 pr-3 py-2 text-base text-neutral-200 focus:outline-none focus:border-neutral-600" />
                            </div>
                        </motion.div>

                        <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="border border-neutral-800 rounded-xl p-6 flex flex-col gap-6">
                            <div className="flex items-center gap-3"><Scaling size={16} className="text-neutral-300"/><h4 className="font-semibold text-white">Type Scale Engine</h4></div>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-sm font-medium text-neutral-300 mb-2 block">Base Scale</label>
                                    <Select options={dynamicBaseIndexOptions} selected={settings.baseScaleIndex} onSelect={(val) => handleSettingsChange({ baseScaleIndex: val })}/>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-1.5"><Smartphone size={14} /> Min Size (Mobile)</label>
                                    <ValueStepper value={settings.minSize} onValueChange={(val) => handleSettingsChange({ minSize: val })} unit="px"/>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-1.5"><Monitor size={14} /> Max Size (Desktop)</label>
                                    <ValueStepper value={settings.maxSize} onValueChange={(val) => handleSettingsChange({ maxSize: val })} unit="px"/>
                                </div>
                                <RatioSlider label="Min Scale Ratio" value={settings.minScaleRatio} onValueChange={(val) => handleSettingsChange({ minScaleRatio: val })} />
                                <RatioSlider label="Max Scale Ratio" value={settings.maxScaleRatio} onValueChange={(val) => handleSettingsChange({ maxScaleRatio: val })} />
                            </div>
                        </motion.div>
                        <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
                            <button
                                onClick={() => onRemoveGroup(activeGroupId)}
                                className="w-full text-center text-sm text-neutral-500 hover:text-red-500 hover:bg-red-500/10 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14} /> Delete Type Scale
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default TypographySidebar;