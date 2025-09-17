// src/App.jsx
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CSSPreviewPanel from './components/CSSPreviewPanel';
import PageRenderer from './components/PageRenderer';
import { initialClassDefinitions } from './components/spacing/ClassGenerator';
import { generateSpacingScale } from './utils/spacingCalculator';
import { nanoid } from 'nanoid';
import { Search, Grid2X2 } from 'lucide-react';

const defaultSpacingSettings = {
  namingConvention: 'space', minSize: 16, maxSize: 28, minScaleRatio: 1.25,
  maxScaleRatio: 1.41, baseScaleIndex: 'm', negativeSteps: 4, positiveSteps: 4,
};

function App() {
  const [colorGroups, setColorGroups] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePage, setActivePage] = useState('Colors');
  const [isSpacingEnabled, setIsSpacingEnabled] = useState(false);
  
  const [spacingGroups, setSpacingGroups] = useState([]);
  const [generatorConfig, setGeneratorConfig] = useState(initialClassDefinitions.map(def => ({ ...def, enabled: true, scaleGroupId: null })));
  const [selectorGroups, setSelectorGroups] = useState([]);
  const [variableGroups, setVariableGroups] = useState([]);
  const [layoutSelectorGroups, setLayoutSelectorGroups] = useState([]);
  const [layoutVariableGroups, setLayoutVariableGroups] = useState([]);
  const [designSelectorGroups, setDesignSelectorGroups] = useState([]);
  const [designVariableGroups, setDesignVariableGroups] = useState([]);
  const [customCSS, setCustomCSS] = useState('/* Your custom styles go here */');

  const handleEnableSpacing = () => {
    if (spacingGroups.length === 0) {
      const defaultGroup = { id: nanoid(), name: 'Default Scale', settings: { ...defaultSpacingSettings } };
      setSpacingGroups([defaultGroup]);
      setGeneratorConfig(prev => prev.map(gen => ({ ...gen, scaleGroupId: defaultGroup.id })));
    }
    setIsSpacingEnabled(true);
  };
  
  const spacingScale = useMemo(() => {
    if (!isSpacingEnabled) return [];
    return spacingGroups.flatMap(group => generateSpacingScale(group.settings));
  }, [spacingGroups, isSpacingEnabled]);
  
  const handleAddSpacingGroup = () => {
    const newGroup = {
      id: nanoid(), name: `Scale ${spacingGroups.length + 1}`,
      settings: { ...defaultSpacingSettings, namingConvention: `space-${spacingGroups.length + 1}` }
    };
    setSpacingGroups(prev => [...prev, newGroup]);
    if (spacingGroups.length === 0) {
      setGeneratorConfig(prev => prev.map(gen => ({ ...gen, scaleGroupId: newGroup.id })));
    }
    return newGroup.id;
  };

  const handleRemoveSpacingGroup = (groupId) => {
    setSpacingGroups(prev => {
      const remainingGroups = prev.filter(group => group.id !== groupId);
      const newDefaultScaleId = remainingGroups.length > 0 ? remainingGroups[0].id : null;
      setGeneratorConfig(configs => configs.map(config => {
        if (config.scaleGroupId === groupId) {
          return { ...config, scaleGroupId: newDefaultScaleId };
        }
        return config;
      }));
      return remainingGroups;
    });
  };
  
  const handleAddClass = () => {
    const defaultScaleId = spacingGroups.length > 0 ? spacingGroups[0].id : null;
    setGeneratorConfig(prev => [...prev, { id: nanoid(), className: '.new-class-*', properties: [''], enabled: true, scaleGroupId: defaultScaleId }]);
  };
  
  const handleUpdateSpacingGroup = (groupId, updatedSettings) => { setSpacingGroups(prev => prev.map(group => group.id === groupId ? { ...group, settings: { ...group.settings, ...updatedSettings } } : group)); };
  const handleUpdateSpacingGroupName = (groupId, newName) => { setSpacingGroups(prev => prev.map(group => group.id === groupId ? { ...group, name: newName } : group)); };
  const handleStepsChange = (groupId, type, amount) => { const group = spacingGroups.find(g => g.id === groupId); if (!group) return; const key = type === 'negative' ? 'negativeSteps' : 'positiveSteps'; const currentSteps = group.settings[key]; const newSteps = Math.max(1, Math.min(25, currentSteps + amount)); handleUpdateSpacingGroup(groupId, { [key]: newSteps }); };
  const handleAddColorGroup = () => { const newGroup = { id: nanoid(), name: `Color Group ${colorGroups.length + 1}`, colors: [] }; setColorGroups(prev => [...prev, newGroup]); };
  const handleUpdateColorGroup = (groupId, updatedProperties) => { setColorGroups(prev => prev.map(group => group.id === groupId ? { ...group, ...updatedProperties } : group)); };
  const handleRemoveColorGroup = (groupId) => { setColorGroups(prev => prev.filter(group => group.id !== groupId)); };
  const handleGeneratorChange = (id, newValues) => setGeneratorConfig(prev => prev.map(item => item.id === id ? { ...item, ...newValues } : item));
  const handleRemoveClass = (id) => setGeneratorConfig(prev => prev.filter(item => item.id !== id));
  const handleAddSelectorGroup = () => setSelectorGroups(prev => [...prev, { id: nanoid(), name: 'Custom Selector Group', rules: [{ id: nanoid(), selector: '.class-name', properties: [{ id: nanoid(), property: '', value: '' }] }] }]);
  const handleUpdateSelectorGroup = (updatedGroup) => setSelectorGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  const handleRemoveSelectorGroup = (id) => setSelectorGroups(prev => prev.filter(g => g.id !== id));
  const handleAddVariableGroup = () => setVariableGroups(prev => [...prev, { id: nanoid(), name: 'Custom Variable Group', variables: [{ id: nanoid(), name: '--variable', value: '', mode: 'single', minValue: 0, maxValue: 0 }] }]);
  const handleUpdateVariableGroup = (updatedGroup) => setVariableGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  const handleRemoveVariableGroup = (id) => setVariableGroups(prev => prev.filter(g => g.id !== id));
  const handleAddLayoutSelectorGroup = () => setLayoutSelectorGroups(prev => [...prev, { id: nanoid(), name: 'Layout Selector Group', rules: [{ id: nanoid(), selector: '.container', properties: [{ id: nanoid(), property: 'width', value: '100%' }] }] }]);
  const handleUpdateLayoutSelectorGroup = (updatedGroup) => setLayoutSelectorGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  const handleRemoveLayoutSelectorGroup = (id) => setLayoutSelectorGroups(prev => prev.filter(g => g.id !== id));
  const handleAddLayoutVariableGroup = () => setLayoutVariableGroups(prev => [...prev, { id: nanoid(), name: 'Layout Variable Group', variables: [{ id: nanoid(), name: '--header-height', value: '60px', mode: 'single', minValue: 0, maxValue: 0 }] }]);
  const handleUpdateLayoutVariableGroup = (updatedGroup) => setLayoutVariableGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  const handleRemoveLayoutVariableGroup = (id) => setLayoutVariableGroups(prev => prev.filter(g => g.id !== id));
  const handleAddDesignSelectorGroup = () => setDesignSelectorGroups(prev => [...prev, { id: nanoid(), name: 'Design Selector Group', rules: [{ id: nanoid(), selector: '.button', properties: [{ id: nanoid(), property: 'border-radius', value: '8px' }] }] }]);
  const handleUpdateDesignSelectorGroup = (updatedGroup) => setDesignSelectorGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  const handleRemoveDesignSelectorGroup = (id) => setDesignSelectorGroups(prev => prev.filter(g => g.id !== id));
  const handleAddDesignVariableGroup = () => setDesignVariableGroups(prev => [...prev, { id: nanoid(), name: 'Design Variable Group', variables: [{ id: nanoid(), name: '--border-radius-md', value: '8px', mode: 'single', minValue: 0, maxValue: 0 }] }]);
  const handleUpdateDesignVariableGroup = (updatedGroup) => setDesignVariableGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  const handleRemoveDesignVariableGroup = (id) => setDesignVariableGroups(prev => prev.filter(g => g.id !== id));

  return (
    <div className="flex flex-col h-screen bg-black font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <div className="flex-1 flex flex-col bg-[#050505]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-900 shrink-0">
            <div className="flex items-center gap-2"><button className="px-3 py-1.5 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:bg-neutral-800 transition-colors">All breakpoints</button><button className="flex items-center justify-center w-8 h-8 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">+</button></div>
            <div className="flex items-center gap-4"><div className="flex items-center gap-2"><button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"><Search size={16} /></button><button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"><Grid2X2 size={16} /></button></div><button onClick={() => setIsPreviewOpen(true)} className="px-4 py-2 text-sm font-semibold bg-brand rounded-md text-white hover:bg-brand-light transition-colors shadow-[0_0_15px_rgba(147,51,234,0.4)]">Export</button></div>
          </div>
          <PageRenderer 
            activePage={activePage}
            colorGroups={colorGroups} onAddColorGroup={handleAddColorGroup} onUpdateColorGroup={handleUpdateColorGroup} onRemoveColorGroup={handleRemoveColorGroup}
            isSpacingEnabled={isSpacingEnabled} handleEnableSpacing={handleEnableSpacing}
            spacingGroups={spacingGroups} onAddSpacingGroup={handleAddSpacingGroup} onUpdateSpacingGroup={handleUpdateSpacingGroup} onUpdateSpacingGroupName={handleUpdateSpacingGroupName} onRemoveSpacingGroup={handleRemoveSpacingGroup} onStepsChange={handleStepsChange}
            scale={spacingScale}
            generatorConfig={generatorConfig} onGeneratorChange={handleGeneratorChange} onAddClass={handleAddClass} onRemoveClass={handleRemoveClass}
            selectorGroups={selectorGroups} onAddSelectorGroup={handleAddSelectorGroup} onUpdateSelectorGroup={handleUpdateSelectorGroup} onRemoveSelectorGroup={handleRemoveSelectorGroup}
            variableGroups={variableGroups} onAddVariableGroup={handleAddVariableGroup} onUpdateVariableGroup={handleUpdateVariableGroup} onRemoveVariableGroup={handleRemoveVariableGroup}
            customCSS={customCSS} setCustomCSS={setCustomCSS}
            layoutSelectorGroups={layoutSelectorGroups} onAddLayoutSelectorGroup={handleAddLayoutSelectorGroup} onUpdateLayoutSelectorGroup={handleUpdateLayoutSelectorGroup} onRemoveLayoutSelectorGroup={handleRemoveLayoutSelectorGroup}
            layoutVariableGroups={layoutVariableGroups} onAddLayoutVariableGroup={handleAddLayoutVariableGroup} onUpdateLayoutVariableGroup={handleUpdateLayoutVariableGroup} onRemoveLayoutVariableGroup={handleRemoveLayoutVariableGroup}
            designSelectorGroups={designSelectorGroups} onAddDesignSelectorGroup={handleAddDesignSelectorGroup} onUpdateDesignSelectorGroup={handleUpdateDesignSelectorGroup} onRemoveDesignSelectorGroup={handleRemoveDesignSelectorGroup}
            designVariableGroups={designVariableGroups} onAddDesignVariableGroup={handleAddDesignVariableGroup} onUpdateDesignVariableGroup={handleUpdateDesignVariableGroup} onRemoveDesignVariableGroup={handleRemoveDesignVariableGroup}
          />
        </div>
      </div>
      <CSSPreviewPanel 
        isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}
        colorGroups={colorGroups} isSpacingEnabled={isSpacingEnabled}
        spacingScale={spacingScale}
        // --- THIS IS THE FIX: Pass the full spacingGroups array ---
        spacingGroups={spacingGroups} 
        generatorConfig={generatorConfig} selectorGroups={selectorGroups} variableGroups={variableGroups}
        customCSS={customCSS} layoutSelectorGroups={layoutSelectorGroups} layoutVariableGroups={layoutVariableGroups}
        designSelectorGroups={designSelectorGroups} designVariableGroups={designVariableGroups}
      />
    </div>
  );
}

export default App;