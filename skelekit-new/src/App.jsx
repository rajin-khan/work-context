// src/App.jsx
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CSSPreviewPanel from './components/CSSPreviewPanel';
import PageRenderer from './components/PageRenderer';
import Modal from './components/ui/Modal';
import ComponentEditor from './components/components/ComponentEditor';
import { initialClassDefinitions } from './components/spacing/ClassGenerator';
import { initialTypographyClassDefinitions } from './components/typography/TypographyClassGenerator';
import { generateSpacingScale } from './utils/spacingCalculator';
import { nanoid } from 'nanoid';
import { Search, Grid2X2 } from 'lucide-react';

const defaultSpacingSettings = {
  namingConvention: 'space',
  minSize: 16,
  maxSize: 28,
  minScaleRatio: 1.25,
  maxScaleRatio: 1.41,
  baseScaleIndex: 'm',
  negativeSteps: 4,
  positiveSteps: 4,
};

const defaultTypographySettings = {
  namingConvention: 'text',
  minSize: 16,
  maxSize: 24,
  minScaleRatio: 1.2,
  maxScaleRatio: 1.33,
  baseScaleIndex: 'm',
  negativeSteps: 2,
  positiveSteps: 5,
};

function App() {
  const [colorGroups, setColorGroups] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePage, setActivePage] = useState('Colors');

  // Spacing State
  const [isSpacingEnabled, setIsSpacingEnabled] = useState(false);
  const [spacingGroups, setSpacingGroups] = useState([]);
  const [generatorConfig, setGeneratorConfig] = useState(
    initialClassDefinitions.map((def) => ({
      ...def,
      enabled: true,
      scaleGroupId: null,
    }))
  );

  // Typography State
  const [isTypographyEnabled, setIsTypographyEnabled] = useState(false);
  const [typographyGroups, setTypographyGroups] = useState([]);
  const [typographyGeneratorConfig, setTypographyGeneratorConfig] = useState(
    initialTypographyClassDefinitions.map((def) => ({
      ...def,
      enabled: true,
      scaleGroupId: null,
    }))
  );
  const [typographySelectorGroups, setTypographySelectorGroups] = useState([]);
  const [typographyVariableGroups, setTypographyVariableGroups] = useState([]);

  // Components State
  const [components, setComponents] = useState([]);
  const [draftComponent, setDraftComponent] = useState(null);

  // Other State
  const [selectorGroups, setSelectorGroups] = useState([]);
  const [variableGroups, setVariableGroups] = useState([]);
  const [layoutSelectorGroups, setLayoutSelectorGroups] = useState([]);
  const [layoutVariableGroups, setLayoutVariableGroups] = useState([]);
  const [designSelectorGroups, setDesignSelectorGroups] = useState([]);
  const [designVariableGroups, setDesignVariableGroups] = useState([]);
  const [customCSS, setCustomCSS] = useState(
    '/* Your custom styles go here */'
  );

  const handleEnableTypography = () => {
    if (typographyGroups.length === 0) {
      const defaultGroup = {
        id: nanoid(),
        name: 'Default Type Scale',
        settings: { ...defaultTypographySettings },
      };
      setTypographyGroups([defaultGroup]);
      setTypographyGeneratorConfig((prev) =>
        prev.map((gen) => ({ ...gen, scaleGroupId: defaultGroup.id }))
      );
    }
    setIsTypographyEnabled(true);
  };
  const handleAddTypographyGroup = () => {
    const newGroup = {
      id: nanoid(),
      name: `Type Scale ${typographyGroups.length + 1}`,
      settings: {
        ...defaultTypographySettings,
        namingConvention: `text-${typographyGroups.length + 1}`,
      },
    };
    setTypographyGroups((prev) => [...prev, newGroup]);
    if (typographyGroups.length === 0) {
      setTypographyGeneratorConfig((prev) =>
        prev.map((gen) => ({ ...gen, scaleGroupId: newGroup.id }))
      );
    }
    return newGroup.id;
  };
  const handleRemoveTypographyGroup = (groupId) => {
    setTypographyGroups((prev) => {
      const remainingGroups = prev.filter((group) => group.id !== groupId);
      const newDefaultScaleId =
        remainingGroups.length > 0 ? remainingGroups[0].id : null;
      setTypographyGeneratorConfig((configs) =>
        configs.map((config) => {
          if (config.scaleGroupId === groupId) {
            return { ...config, scaleGroupId: newDefaultScaleId };
          }
          return config;
        })
      );
      return remainingGroups;
    });
  };
  const handleAddTypographyClass = () => {
    const defaultScaleId =
      typographyGroups.length > 0 ? typographyGroups[0].id : null;
    setTypographyGeneratorConfig((prev) => [
      ...prev,
      {
        id: nanoid(),
        className: '.new-type-class-*',
        properties: [''],
        enabled: true,
        scaleGroupId: defaultScaleId,
      },
    ]);
  };
  const handleRemoveTypographyClass = (id) => {
    setTypographyGeneratorConfig((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };
  const handleTypographyGeneratorChange = (id, newValues) => {
    setTypographyGeneratorConfig((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...newValues } : item))
    );
  };
  const handleUpdateTypographyGroup = (groupId, updatedSettings) => {
    setTypographyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, settings: { ...group.settings, ...updatedSettings } }
          : group
      )
    );
  };
  const handleUpdateTypographyGroupName = (groupId, newName) => {
    setTypographyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
  };
  const handleTypographyStepsChange = (groupId, type, amount) => {
    const group = typographyGroups.find((g) => g.id === groupId);
    if (!group) return;
    const key = type === 'negative' ? 'negativeSteps' : 'positiveSteps';
    const currentSteps = group.settings[key];
    const newSteps = Math.max(1, Math.min(25, currentSteps + amount));
    handleUpdateTypographyGroup(groupId, { [key]: newSteps });
  };
  const handleAddTypographySelectorGroup = () =>
    setTypographySelectorGroups((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: 'New Type Selector Group',
        rules: [
          {
            id: nanoid(),
            selector: '.heading-1',
            properties: [
              { id: nanoid(), property: 'font-size', value: 'var(--text-xl)' },
            ],
          },
        ],
      },
    ]);
  const handleUpdateTypographySelectorGroup = (updatedGroup) =>
    setTypographySelectorGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveTypographySelectorGroup = (id) =>
    setTypographySelectorGroups((prev) => prev.filter((g) => g.id !== id));
  const handleAddTypographyVariableGroup = () =>
    setTypographyVariableGroups((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: 'New Type Variable Group',
        variables: [
          {
            id: nanoid(),
            name: '--font-weight-bold',
            value: '700',
            mode: 'single',
            minValue: 0,
            maxValue: 0,
          },
        ],
      },
    ]);
  const handleUpdateTypographyVariableGroup = (updatedGroup) =>
    setTypographyVariableGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveTypographyVariableGroup = (id) =>
    setTypographyVariableGroups((prev) => prev.filter((g) => g.id !== id));

  const handleEnableSpacing = () => {
    if (spacingGroups.length === 0) {
      const defaultGroup = {
        id: nanoid(),
        name: 'Default Scale',
        settings: { ...defaultSpacingSettings },
      };
      setSpacingGroups([defaultGroup]);
      setGeneratorConfig((prev) =>
        prev.map((gen) => ({ ...gen, scaleGroupId: defaultGroup.id }))
      );
    }
    setIsSpacingEnabled(true);
  };
  const handleAddSpacingGroup = () => {
    const newGroup = {
      id: nanoid(),
      name: `Scale ${spacingGroups.length + 1}`,
      settings: {
        ...defaultSpacingSettings,
        namingConvention: `space-${spacingGroups.length + 1}`,
      },
    };
    setSpacingGroups((prev) => [...prev, newGroup]);
    if (spacingGroups.length === 0) {
      setGeneratorConfig((prev) =>
        prev.map((gen) => ({ ...gen, scaleGroupId: newGroup.id }))
      );
    }
    return newGroup.id;
  };
  const handleRemoveSpacingGroup = (groupId) => {
    setSpacingGroups((prev) => {
      const remainingGroups = prev.filter((group) => group.id !== groupId);
      const newDefaultScaleId =
        remainingGroups.length > 0 ? remainingGroups[0].id : null;
      setGeneratorConfig((configs) =>
        configs.map((config) => {
          if (config.scaleGroupId === groupId) {
            return { ...config, scaleGroupId: newDefaultScaleId };
          }
          return config;
        })
      );
      return remainingGroups;
    });
  };
  const handleUpdateSpacingGroup = (groupId, updatedSettings) => {
    setSpacingGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, settings: { ...group.settings, ...updatedSettings } }
          : group
      )
    );
  };
  const handleUpdateSpacingGroupName = (groupId, newName) => {
    setSpacingGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
  };
  const handleStepsChange = (groupId, type, amount) => {
    const group = spacingGroups.find((g) => g.id === groupId);
    if (!group) return;
    const key = type === 'negative' ? 'negativeSteps' : 'positiveSteps';
    const currentSteps = group.settings[key];
    const newSteps = Math.max(1, Math.min(25, currentSteps + amount));
    handleUpdateSpacingGroup(groupId, { [key]: newSteps });
  };

  const handleAddComponent = (type) => {
    if (type === 'button') {
      const newButton = {
        id: nanoid(),
        type: 'button',
        name: 'btn',
        styles: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: '10px 20px',
          background: '#2563eb',
          color: '#ffffff',
          'font-size': '16px',
          'font-weight': '600',
          'border-radius': '8px',
          border: 'none',
          cursor: 'pointer',
          transition:
            'background-color 0.2s ease-in-out, transform 0.1s ease',
        },
        states: {
          hover: {
            background: '#1d4ed8',
            transform: 'translateY(-1px)',
          },
          focus: {
            outline: '3px solid rgba(96, 165, 250, 0.5)',
            'outline-offset': '2px',
          },
        },
        modifiers: [],
      };
      setComponents((prev) => [...prev, newButton]);
    }
  };

  const handleEditComponent = (id) => {
    const componentToEdit = components.find((c) => c.id === id);
    if (componentToEdit) {
      setDraftComponent(JSON.parse(JSON.stringify(componentToEdit)));
    }
  };

  const handleSaveComponent = () => {
    if (!draftComponent) return;
    setComponents((prev) =>
      prev.map((c) => (c.id === draftComponent.id ? draftComponent : c))
    );
    setDraftComponent(null);
  };

  const handleDiscardChanges = () => {
    setDraftComponent(null);
  };

  const spacingScale = useMemo(() => {
    if (!isSpacingEnabled) return [];
    return spacingGroups.flatMap((group) =>
      generateSpacingScale(group.settings)
    );
  }, [spacingGroups, isSpacingEnabled]);

  const typographyScale = useMemo(() => {
    if (!isTypographyEnabled) return [];
    return typographyGroups.flatMap((group) =>
      generateSpacingScale(group.settings)
    );
  }, [typographyGroups, isTypographyEnabled]);

  const handleAddClass = () => {
    const defaultScaleId =
      spacingGroups.length > 0 ? spacingGroups[0].id : null;
    setGeneratorConfig((prev) => [
      ...prev,
      {
        id: nanoid(),
        className: '.new-class-*',
        properties: [''],
        enabled: true,
        scaleGroupId: defaultScaleId,
      },
    ]);
  };
  const handleAddColorGroup = () => {
    const newGroup = {
      id: nanoid(),
      name: `Color Group ${colorGroups.length + 1}`,
      colors: [],
    };
    setColorGroups((prev) => [...prev, newGroup]);
  };
  const handleUpdateColorGroup = (groupId, updatedProperties) => {
    setColorGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, ...updatedProperties } : group
      )
    );
  };
  const handleRemoveColorGroup = (groupId) => {
    setColorGroups((prev) => prev.filter((group) => group.id !== groupId));
  };
  const handleGeneratorChange = (id, newValues) =>
    setGeneratorConfig((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...newValues } : item))
    );
  const handleRemoveClass = (id) =>
    setGeneratorConfig((prev) => prev.filter((item) => item.id !== id));
  const handleAddSelectorGroup = () =>
    setSelectorGroups((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: 'Custom Selector Group',
        rules: [
          {
            id: nanoid(),
            selector: '.class-name',
            properties: [{ id: nanoid(), property: '', value: '' }],
          },
        ],
      },
    ]);
  const handleUpdateSelectorGroup = (updatedGroup) =>
    setSelectorGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveSelectorGroup = (id) =>
    setSelectorGroups((prev) => prev.filter((g) => g.id !== id));
  const handleAddVariableGroup = () =>
    setVariableGroups((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: 'Custom Variable Group',
        variables: [
          {
            id: nanoid(),
            name: '--variable',
            value: '',
            mode: 'single',
            minValue: 0,
            maxValue: 0,
          },
        ],
      },
    ]);
  const handleUpdateVariableGroup = (updatedGroup) =>
    setVariableGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveVariableGroup = (id) =>
    setVariableGroups((prev) => prev.filter((g) => g.id !== id));
  const handleAddLayoutSelectorGroup = () =>
    setLayoutSelectorGroups((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: 'Layout Selector Group',
        rules: [
          {
            id: nanoid(),
            selector: '.container',
            properties: [{ id: nanoid(), property: 'width', value: '100%' }],
          },
        ],
      },
    ]);
  const handleUpdateLayoutSelectorGroup = (updatedGroup) =>
    setLayoutSelectorGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveLayoutSelectorGroup = (id) =>
    setLayoutSelectorGroups((prev) => prev.filter((g) => g.id !== id));
  const handleAddLayoutVariableGroup = () =>
    setLayoutVariableGroups((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: 'Layout Variable Group',
        variables: [
          {
            id: nanoid(),
            name: '--header-height',
            value: '60px',
            mode: 'single',
            minValue: 0,
            maxValue: 0,
          },
        ],
      },
    ]);
  const handleUpdateLayoutVariableGroup = (updatedGroup) =>
    setLayoutVariableGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveLayoutVariableGroup = (id) =>
    setLayoutVariableGroups((prev) => prev.filter((g) => g.id !== id));
  const handleAddDesignSelectorGroup = () =>
    setDesignSelectorGroups((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: 'Design Selector Group',
        rules: [
          {
            id: nanoid(),
            selector: '.button',
            properties: [
              { id: nanoid(), property: 'border-radius', value: '8px' },
            ],
          },
        ],
      },
    ]);
  const handleUpdateDesignSelectorGroup = (updatedGroup) =>
    setDesignSelectorGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveDesignSelectorGroup = (id) =>
    setDesignSelectorGroups((prev) => prev.filter((g) => g.id !== id));
  const handleAddDesignVariableGroup = () =>
    setDesignVariableGroups((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: 'Design Variable Group',
        variables: [
          {
            id: nanoid(),
            name: '--border-radius-md',
            value: '8px',
            mode: 'single',
            minValue: 0,
            maxValue: 0,
          },
        ],
      },
    ]);
  const handleUpdateDesignVariableGroup = (updatedGroup) =>
    setDesignVariableGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveDesignVariableGroup = (id) =>
    setDesignVariableGroups((prev) => prev.filter((g) => g.id !== id));

  return (
    <div className="flex flex-col h-screen bg-black font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <div className="flex-1 flex flex-col bg-[#050505]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-900 shrink-0">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:bg-neutral-800 transition-colors">
                All breakpoints
              </button>
              <button className="flex items-center justify-center w-8 h-8 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                +
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors">
                  <Search size={16} />
                </button>
                <button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors">
                  <Grid2X2 size={16} />
                </button>
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
            colorGroups={colorGroups}
            onAddColorGroup={handleAddColorGroup}
            onUpdateColorGroup={handleUpdateColorGroup}
            onRemoveColorGroup={handleRemoveColorGroup}
            isSpacingEnabled={isSpacingEnabled}
            handleEnableSpacing={handleEnableSpacing}
            spacingGroups={spacingGroups}
            onAddSpacingGroup={handleAddSpacingGroup}
            onUpdateSpacingGroup={handleUpdateSpacingGroup}
            onUpdateSpacingGroupName={handleUpdateSpacingGroupName}
            onRemoveSpacingGroup={handleRemoveSpacingGroup}
            onStepsChange={handleStepsChange}
            scale={spacingScale}
            isTypographyEnabled={isTypographyEnabled}
            handleEnableTypography={handleEnableTypography}
            typographyGroups={typographyGroups}
            onAddTypographyGroup={handleAddTypographyGroup}
            onUpdateTypographyGroup={handleUpdateTypographyGroup}
            onUpdateTypographyGroupName={handleUpdateTypographyGroupName}
            onRemoveTypographyGroup={handleRemoveTypographyGroup}
            onTypographyStepsChange={handleTypographyStepsChange}
            typographyGeneratorConfig={typographyGeneratorConfig}
            onAddTypographyClass={handleAddTypographyClass}
            onRemoveTypographyClass={handleRemoveTypographyClass}
            onTypographyGeneratorChange={handleTypographyGeneratorChange}
            typographySelectorGroups={typographySelectorGroups}
            onAddTypographySelectorGroup={handleAddTypographySelectorGroup}
            onUpdateTypographySelectorGroup={handleUpdateTypographySelectorGroup}
            onRemoveTypographySelectorGroup={handleRemoveTypographySelectorGroup}
            typographyVariableGroups={typographyVariableGroups}
            onAddTypographyVariableGroup={handleAddTypographyVariableGroup}
            onUpdateTypographyVariableGroup={handleUpdateTypographyVariableGroup}
            onRemoveTypographyVariableGroup={handleRemoveTypographyVariableGroup}
            typographyScale={typographyScale}
            generatorConfig={generatorConfig}
            onGeneratorChange={handleGeneratorChange}
            onAddClass={handleAddClass}
            onRemoveClass={handleRemoveClass}
            selectorGroups={selectorGroups}
            onAddSelectorGroup={handleAddSelectorGroup}
            onUpdateSelectorGroup={handleUpdateSelectorGroup}
            onRemoveSelectorGroup={handleRemoveSelectorGroup}
            variableGroups={variableGroups}
            onAddVariableGroup={handleAddVariableGroup}
            onUpdateVariableGroup={handleUpdateVariableGroup}
            onRemoveVariableGroup={handleRemoveVariableGroup}
            customCSS={customCSS}
            setCustomCSS={setCustomCSS}
            layoutSelectorGroups={layoutSelectorGroups}
            onAddLayoutSelectorGroup={handleAddLayoutSelectorGroup}
            onUpdateLayoutSelectorGroup={handleUpdateLayoutSelectorGroup}
            onRemoveLayoutSelectorGroup={handleRemoveLayoutSelectorGroup}
            layoutVariableGroups={layoutVariableGroups}
            onAddLayoutVariableGroup={handleAddLayoutVariableGroup}
            onUpdateLayoutVariableGroup={handleUpdateLayoutVariableGroup}
            onRemoveLayoutVariableGroup={handleRemoveLayoutVariableGroup}
            designSelectorGroups={designSelectorGroups}
            onAddDesignSelectorGroup={handleAddDesignSelectorGroup}
            onUpdateDesignSelectorGroup={handleUpdateDesignSelectorGroup}
            onRemoveDesignSelectorGroup={handleRemoveDesignSelectorGroup}
            designVariableGroups={designVariableGroups}
            onAddDesignVariableGroup={handleAddDesignVariableGroup}
            onUpdateDesignVariableGroup={handleUpdateDesignVariableGroup}
            onRemoveDesignVariableGroup={handleRemoveDesignVariableGroup}
            components={components}
            onAddComponent={handleAddComponent}
            onEditComponent={handleEditComponent}
          />
        </div>
      </div>

      <CSSPreviewPanel
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        {...{
          colorGroups,
          isSpacingEnabled,
          spacingScale,
          spacingGroups,
          isTypographyEnabled,
          typographyScale,
          typographyGroups,
          typographyGeneratorConfig,
          typographySelectorGroups,
          typographyVariableGroups,
          generatorConfig,
          selectorGroups,
          variableGroups,
          customCSS,
          layoutSelectorGroups,
          layoutVariableGroups,
          designSelectorGroups,
          designVariableGroups,
        }}
      />
      <Modal
        isOpen={!!draftComponent}
        onSave={handleSaveComponent}
        onDiscard={handleDiscardChanges}
      >
        {draftComponent && (
          <ComponentEditor
            component={draftComponent}
            setComponent={setDraftComponent}
          />
        )}
      </Modal>
    </div>
  );
}

export default App;