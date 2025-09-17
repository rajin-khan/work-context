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

function App() {
  // --- STATE MANAGEMENT ---
  const [colors, setColors] = useState([]);
  const [groupName, setGroupName] = useState('Untitled');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePage, setActivePage] = useState('Colors');
  const [isSpacingEnabled, setIsSpacingEnabled] = useState(false);
  const handleEnableSpacing = () => setIsSpacingEnabled(true);
  
  // Spacing State
  const [spacingSettings, setSpacingSettings] = useState({
    namingConvention: 'space', minSize: 16, maxSize: 28, minScaleRatio: 1.25,
    maxScaleRatio: 1.41, baseScaleIndex: 'm', negativeSteps: 4, positiveSteps: 4,
  });
  const [generatorConfig, setGeneratorConfig] = useState(initialClassDefinitions.map(def => ({ ...def, enabled: true })));
  const [selectorGroups, setSelectorGroups] = useState([]);
  const [variableGroups, setVariableGroups] = useState([]);

  // Layout State
  const [layoutSelectorGroups, setLayoutSelectorGroups] = useState([]);
  const [layoutVariableGroups, setLayoutVariableGroups] = useState([]);
  
  // Design State (NEW)
  const [designSelectorGroups, setDesignSelectorGroups] = useState([]);
  const [designVariableGroups, setDesignVariableGroups] = useState([]);

  // Stylesheet State
  const [customCSS, setCustomCSS] = useState('/* Your custom styles go here */');

  const spacingScale = useMemo(() => {
    return isSpacingEnabled ? generateSpacingScale(spacingSettings) : [];
  }, [spacingSettings, isSpacingEnabled]);
  
  // --- SPACING HANDLERS ---
  const handleStepsChange = (type, amount) => {
    const key = type === 'negative' ? 'negativeSteps' : 'positiveSteps';
    const currentSteps = spacingSettings[key];
    const newSteps = Math.max(1, Math.min(25, currentSteps + amount));
    setSpacingSettings(prev => ({ ...prev, [key]: newSteps }));
  };
  const handleGeneratorChange = (id, newValues) => {
    setGeneratorConfig(prev => prev.map(item => item.id === id ? { ...item, ...newValues } : item));
  };
  const handleAddClass = () => {
    setGeneratorConfig(prev => [...prev, { id: nanoid(), className: '.new-class-*', properties: [''], enabled: true }]);
  };
  const handleRemoveClass = (id) => {
    setGeneratorConfig(prev => prev.filter(item => item.id !== id));
  };
  const handleAddSelectorGroup = () => {
    const newGroup = { id: nanoid(), name: 'Custom Selector Group', rules: [{ id: nanoid(), selector: '.class-name', properties: [{ id: nanoid(), property: '', value: '' }] }] };
    setSelectorGroups(prev => [...prev, newGroup]);
  };
  const handleUpdateSelectorGroup = (updatedGroup) => {
    setSelectorGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  const handleRemoveSelectorGroup = (id) => {
    setSelectorGroups(prev => prev.filter(g => g.id !== id));
  };
  const handleAddVariableGroup = () => {
    const newGroup = { id: nanoid(), name: 'Custom Variable Group', variables: [{ id: nanoid(), name: '--variable', value: '', mode: 'single', minValue: 0, maxValue: 0 }] };
    setVariableGroups(prev => [...prev, newGroup]);
  };
  const handleUpdateVariableGroup = (updatedGroup) => {
    setVariableGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  const handleRemoveVariableGroup = (id) => {
    setVariableGroups(prev => prev.filter(g => g.id !== id));
  };

  // --- LAYOUT HANDLERS ---
  const handleAddLayoutSelectorGroup = () => {
    const newGroup = { id: nanoid(), name: 'Layout Selector Group', rules: [{ id: nanoid(), selector: '.container', properties: [{ id: nanoid(), property: 'width', value: '100%' }] }] };
    setLayoutSelectorGroups(prev => [...prev, newGroup]);
  };
  const handleUpdateLayoutSelectorGroup = (updatedGroup) => {
    setLayoutSelectorGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  const handleRemoveLayoutSelectorGroup = (id) => {
    setLayoutSelectorGroups(prev => prev.filter(g => g.id !== id));
  };
  const handleAddLayoutVariableGroup = () => {
    const newGroup = { id: nanoid(), name: 'Layout Variable Group', variables: [{ id: nanoid(), name: '--header-height', value: '60px', mode: 'single', minValue: 0, maxValue: 0 }] };
    setLayoutVariableGroups(prev => [...prev, newGroup]);
  };
  const handleUpdateLayoutVariableGroup = (updatedGroup) => {
    setLayoutVariableGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  const handleRemoveLayoutVariableGroup = (id) => {
    setLayoutVariableGroups(prev => prev.filter(g => g.id !== id));
  };

  // --- DESIGN HANDLERS (NEW) ---
  const handleAddDesignSelectorGroup = () => {
    const newGroup = { id: nanoid(), name: 'Design Selector Group', rules: [{ id: nanoid(), selector: '.button', properties: [{ id: nanoid(), property: 'border-radius', value: '8px' }] }] };
    setDesignSelectorGroups(prev => [...prev, newGroup]);
  };
  const handleUpdateDesignSelectorGroup = (updatedGroup) => {
    setDesignSelectorGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  const handleRemoveDesignSelectorGroup = (id) => {
    setDesignSelectorGroups(prev => prev.filter(g => g.id !== id));
  };
  const handleAddDesignVariableGroup = () => {
    const newGroup = { id: nanoid(), name: 'Design Variable Group', variables: [{ id: nanoid(), name: '--border-radius-md', value: '8px', mode: 'single', minValue: 0, maxValue: 0 }] };
    setDesignVariableGroups(prev => [...prev, newGroup]);
  };
  const handleUpdateDesignVariableGroup = (updatedGroup) => {
    setDesignVariableGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  const handleRemoveDesignVariableGroup = (id) => {
    setDesignVariableGroups(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-black font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <div className="flex-1 flex flex-col bg-[#050505]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-900 shrink-0">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:bg-neutral-800 transition-colors">All breakpoints</button>
              <button className="flex items-center justify-center w-8 h-8 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">+</button>
            </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"><Search size={16} /></button>
                 <button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"><Grid2X2 size={16} /></button>
               </div>
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2 text-sm font-semibold bg-brand rounded-md text-white hover:bg-brand-light transition-colors shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              >
                Export
              </button>
            </div>
          </div>
          <PageRenderer 
            activePage={activePage}
            colors={colors} setColors={setColors} groupName={groupName} setGroupName={setGroupName}
            isSpacingEnabled={isSpacingEnabled} handleEnableSpacing={handleEnableSpacing}
            spacingSettings={spacingSettings} onSettingsChange={setSpacingSettings}
            scale={spacingScale} onStepsChange={handleStepsChange}
            generatorConfig={generatorConfig} onGeneratorChange={handleGeneratorChange} onAddClass={handleAddClass} onRemoveClass={handleRemoveClass}
            selectorGroups={selectorGroups} onAddSelectorGroup={handleAddSelectorGroup} onUpdateSelectorGroup={handleUpdateSelectorGroup} onRemoveSelectorGroup={handleRemoveSelectorGroup}
            variableGroups={variableGroups} onAddVariableGroup={handleAddVariableGroup} onUpdateVariableGroup={handleUpdateVariableGroup} onRemoveVariableGroup={handleRemoveVariableGroup}
            customCSS={customCSS} setCustomCSS={setCustomCSS}
            layoutSelectorGroups={layoutSelectorGroups} onAddLayoutSelectorGroup={handleAddLayoutSelectorGroup} onUpdateLayoutSelectorGroup={handleUpdateLayoutSelectorGroup} onRemoveLayoutSelectorGroup={handleRemoveLayoutSelectorGroup}
            layoutVariableGroups={layoutVariableGroups} onAddLayoutVariableGroup={handleAddLayoutVariableGroup} onUpdateLayoutVariableGroup={handleUpdateLayoutVariableGroup} onRemoveLayoutVariableGroup={handleRemoveLayoutVariableGroup}
            // Pass Design Props (NEW)
            designSelectorGroups={designSelectorGroups} onAddDesignSelectorGroup={handleAddDesignSelectorGroup} onUpdateDesignSelectorGroup={handleUpdateDesignSelectorGroup} onRemoveDesignSelectorGroup={handleRemoveDesignSelectorGroup}
            designVariableGroups={designVariableGroups} onAddDesignVariableGroup={handleAddDesignVariableGroup} onUpdateDesignVariableGroup={handleUpdateDesignVariableGroup} onRemoveDesignVariableGroup={handleRemoveDesignVariableGroup}
          />
        </div>
      </div>
      <CSSPreviewPanel 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        colors={colors}
        groupName={groupName}
        isSpacingEnabled={isSpacingEnabled}
        spacingScale={spacingScale}
        spacingSettings={spacingSettings}
        generatorConfig={generatorConfig}
        selectorGroups={selectorGroups}
        variableGroups={variableGroups}
        customCSS={customCSS}
        layoutSelectorGroups={layoutSelectorGroups}
        layoutVariableGroups={layoutVariableGroups}
        // Pass Design Props to Preview (NEW)
        designSelectorGroups={designSelectorGroups}
        designVariableGroups={designVariableGroups}
      />
    </div>
  );
}

export default App;