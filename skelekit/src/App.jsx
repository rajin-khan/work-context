// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
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
import LoadingScreen from './pages/LoadingScreen';
import {
  skelementorColorGroups,
  skelementorSpacingGroups,
  skelementorTypographyGroups,
  skelementorDesignVariableGroups,
  skelementorComponents,
  skelementorLayoutVariableGroups,
  skelementorLayoutSelectorGroups,
  skelementorDesignSelectorGroups,
  skelementorTypographySelectorGroups,
  skelementorTypographyVariableGroups,
  skelementorSpacingSelectorGroups,
  skelementorSpacingVariableGroups,
  skelementorCustomCSS
} from './presets/skelementorPreset';

const defaultSpacingSettings = {
  namingConvention: 'space', minSize: 16, maxSize: 28, minScaleRatio: 1.25,
  maxScaleRatio: 1.41, baseScaleIndex: 'm', negativeSteps: 4, positiveSteps: 4,
};

const defaultTypographySettings = {
  namingConvention: 'text', minSize: 16, maxSize: 24, minScaleRatio: 1.2,
  maxScaleRatio: 1.33, baseScaleIndex: 'm', negativeSteps: 2, positiveSteps: 5,
};

const LOCAL_STORAGE_KEY = 'skelekit-workspace';

function App() {
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [colorGroups, setColorGroups] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePage, setActivePage] = useState('Colors');
  const [isSpacingEnabled, setIsSpacingEnabled] = useState(false);
  const [spacingGroups, setSpacingGroups] = useState([]);
  const [generatorConfig, setGeneratorConfig] = useState(() => initialClassDefinitions.map(def => ({ ...def, enabled: true, scaleGroupId: null })));
  const [isTypographyEnabled, setIsTypographyEnabled] = useState(false);
  const [typographyGroups, setTypographyGroups] = useState([]);
  const [typographyGeneratorConfig, setTypographyGeneratorConfig] = useState(() => initialTypographyClassDefinitions.map(def => ({ ...def, enabled: true, scaleGroupId: null })));
  const [typographySelectorGroups, setTypographySelectorGroups] = useState([]);
  const [typographyVariableGroups, setTypographyVariableGroups] = useState([]);
  const [components, setComponents] = useState([]);
  const [draftComponent, setDraftComponent] = useState(null);
  const [selectorGroups, setSelectorGroups] = useState([]);
  const [variableGroups, setVariableGroups] = useState([]);
  const [layoutSelectorGroups, setLayoutSelectorGroups] = useState([]);
  const [layoutVariableGroups, setLayoutVariableGroups] = useState([]);
  const [designSelectorGroups, setDesignSelectorGroups] = useState([]);
  const [designVariableGroups, setDesignVariableGroups] = useState([]);
  const [customCSS, setCustomCSS] = useState('/* Your custom styles go here */');

  // --- START OF THE FIX: LOCALSTORAGE LOGIC ---

  // Effect to LOAD data from localStorage on initial app startup
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setColorGroups(parsedData.colorGroups || []);
        setActivePage(parsedData.activePage || 'Colors');
        setIsSpacingEnabled(parsedData.isSpacingEnabled || false);
        setSpacingGroups(parsedData.spacingGroups || []);
        setGeneratorConfig(parsedData.generatorConfig || initialClassDefinitions.map(def => ({ ...def, enabled: true, scaleGroupId: null })));
        setIsTypographyEnabled(parsedData.isTypographyEnabled || false);
        setTypographyGroups(parsedData.typographyGroups || []);
        setTypographyGeneratorConfig(parsedData.typographyGeneratorConfig || initialTypographyClassDefinitions.map(def => ({ ...def, enabled: true, scaleGroupId: null })));
        setTypographySelectorGroups(parsedData.typographySelectorGroups || []);
        setTypographyVariableGroups(parsedData.typographyVariableGroups || []);
        setComponents(parsedData.components || []);
        setSelectorGroups(parsedData.selectorGroups || []);
        setVariableGroups(parsedData.variableGroups || []);
        setLayoutSelectorGroups(parsedData.layoutSelectorGroups || []);
        setLayoutVariableGroups(parsedData.layoutVariableGroups || []);
        setDesignSelectorGroups(parsedData.designSelectorGroups || []);
        setDesignVariableGroups(parsedData.designVariableGroups || []);
        setCustomCSS(parsedData.customCSS || '/* Your custom styles go here */');
        
        setWorkspaceLoaded(true); // Bypass the loading screen
      } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []); // Empty array ensures this runs only once on mount

  // Effect to SAVE data to localStorage whenever any state changes
  useEffect(() => {
    if (workspaceLoaded) {
      const workspaceData = {
        colorGroups, activePage, isSpacingEnabled, spacingGroups, generatorConfig,
        isTypographyEnabled, typographyGroups, typographyGeneratorConfig,
        typographySelectorGroups, typographyVariableGroups, components, selectorGroups,
        variableGroups, layoutSelectorGroups, layoutVariableGroups, designSelectorGroups,
        designVariableGroups, customCSS
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workspaceData));
    }
  }, [
    workspaceLoaded, colorGroups, activePage, isSpacingEnabled, spacingGroups,
    generatorConfig, isTypographyEnabled, typographyGroups, typographyGeneratorConfig,
    typographySelectorGroups, typographyVariableGroups, components, selectorGroups,
    variableGroups, layoutSelectorGroups, layoutVariableGroups, designSelectorGroups,
    designVariableGroups, customCSS
  ]);

  // --- END OF THE FIX ---

  const handleWorkspaceSelect = (choice) => {
    if (choice === 'preset') {
      setColorGroups(skelementorColorGroups);
      setSpacingGroups(skelementorSpacingGroups);
      setTypographyGroups(skelementorTypographyGroups);
      setDesignVariableGroups(skelementorDesignVariableGroups);
      setComponents(skelementorComponents);
      setIsSpacingEnabled(true);
      setIsTypographyEnabled(true);
      setGeneratorConfig(prev => prev.map(gen => ({ ...gen, scaleGroupId: skelementorSpacingGroups[0]?.id || null })));
      setTypographyGeneratorConfig(prev => prev.map(gen => ({ ...gen, scaleGroupId: skelementorTypographyGroups[0]?.id || null })));
      setLayoutVariableGroups(skelementorLayoutVariableGroups);
      setLayoutSelectorGroups(skelementorLayoutSelectorGroups);
      setDesignSelectorGroups(skelementorDesignSelectorGroups);
      setTypographySelectorGroups(skelementorTypographySelectorGroups);
      setTypographyVariableGroups(skelementorTypographyVariableGroups);
      setSelectorGroups(skelementorSpacingSelectorGroups);
      setVariableGroups(skelementorSpacingVariableGroups);
      setCustomCSS(skelementorCustomCSS);
    }
    // If 'blank', we just reset the state to defaults
    else {
        setColorGroups([]); setSpacingGroups([]); setTypographyGroups([]);
        setDesignVariableGroups([]); setComponents([]); setIsSpacingEnabled(false);
        setIsTypographyEnabled(false); setGeneratorConfig(initialClassDefinitions.map(def => ({ ...def, enabled: true, scaleGroupId: null })));
        setTypographyGeneratorConfig(initialTypographyClassDefinitions.map(def => ({ ...def, enabled: true, scaleGroupId: null })));
        setLayoutVariableGroups([]); setLayoutSelectorGroups([]); setDesignSelectorGroups([]);
        setTypographySelectorGroups([]); setTypographyVariableGroups([]);
        setSelectorGroups([]); setVariableGroups([]); setCustomCSS('/* Your custom styles go here */');
    }
    setWorkspaceLoaded(true);
  };
  
  const allColorVariables = useMemo(() => {
    return colorGroups.flatMap(group =>
      group.colors.flatMap(color => {
        const vars = [{ label: `var(${color.name})`, value: `var(${color.name})` }];
        if (color.shadesConfig?.enabled) {
          color.shadesConfig.palette.forEach((_, i) => {
            const varName = `${color.name}-d-${i + 1}`;
            vars.push({ label: `var(${varName})`, value: `var(${varName})` });
          });
        }
        if (color.tintsConfig?.enabled) {
          color.tintsConfig.palette.forEach((_, i) => {
            const varName = `${color.name}-l-${i + 1}`;
            vars.push({ label: `var(${varName})`, value: `var(${varName})` });
          });
        }
        return vars;
      })
    );
  }, [colorGroups]);

  const allSpacingVariables = useMemo(() => {
    const scaleVars = spacingGroups.flatMap(group =>
      generateSpacingScale(group.settings).map(item => ({ label: `var(${item.name})`, value: `var(${item.name})` }))
    );
    const customVars = variableGroups.flatMap(group =>
      group.variables.map(v => ({ label: `var(${v.name})`, value: `var(${v.name})` }))
    );
    return [...scaleVars, ...customVars];
  }, [spacingGroups, variableGroups]);

  const allTypographyVariables = useMemo(() => {
    const scaleVars = typographyGroups.flatMap(group =>
      generateSpacingScale(group.settings).map(item => ({ label: `var(${item.name})`, value: `var(${item.name})` }))
    );
    const customVars = typographyVariableGroups.flatMap(group =>
      group.variables.map(v => ({ label: `var(${v.name})`, value: `var(${v.name})` }))
    );
    return [...scaleVars, ...customVars];
  }, [typographyGroups, typographyVariableGroups]);

  const allGlobalVariables = useMemo(() => {
    const layoutVars = layoutVariableGroups.flatMap(group =>
        group.variables.map(v => ({ label: `var(${v.name})`, value: `var(${v.name})` }))
    );
    const designVars = designVariableGroups.flatMap(group =>
        group.variables.map(v => ({ label: `var(${v.name})`, value: `var(${v.name})` }))
    );
    return [...allColorVariables, ...allSpacingVariables, ...allTypographyVariables, ...layoutVars, ...designVars];
  }, [allColorVariables, allSpacingVariables, allTypographyVariables, layoutVariableGroups, designVariableGroups]);

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
        styles: [
          { id: nanoid(), prop: 'display', value: 'inline-flex' },
          { id: nanoid(), prop: 'align-items', value: 'center' },
          { id: nanoid(), prop: 'justify-content', value: 'center' },
          { id: nanoid(), prop: 'padding', value: '10px 20px' },
          { id: nanoid(), prop: 'background', value: '#2563eb' },
          { id: nanoid(), prop: 'color', value: '#ffffff' },
          { id: nanoid(), prop: 'font-size', value: '16px' },
          { id: nanoid(), prop: 'font-weight', value: '600' },
          { id: nanoid(), prop: 'border-radius', value: '8px' },
          { id: nanoid(), prop: 'border', value: 'none' },
          { id: nanoid(), prop: 'cursor', value: 'pointer' },
          { id: nanoid(), prop: 'transition', value: 'background-color 0.2s ease-in-out, transform 0.1s ease' },
        ],
        states: {
          hover: [
            { id: nanoid(), prop: 'background', value: '#1d4ed8' },
            { id: nanoid(), prop: 'transform', value: 'translateY(-1px)' },
          ],
          focus: [
            { id: nanoid(), prop: 'outline', value: '3px solid rgba(96, 165, 250, 0.5)' },
            { id: nanoid(), prop: 'outline-offset', value: '2px' },
          ],
        },
        modifiers: [],
      };
      setComponents((prev) => [...prev, newButton]);
    } else if (type === 'input') {
        const newInput = {
            id: nanoid(),
            type: 'input',
            name: 'input-field',
            styles: [
                { id: nanoid(), prop: 'padding', value: '10px 15px' },
                { id: nanoid(), prop: 'font-size', value: '16px' },
                { id: nanoid(), prop: 'background-color', value: '#f3f4f6' },
                { id: nanoid(), prop: 'color', value: '#111827' },
                { id: nanoid(), prop: 'border', value: '1px solid #d1d5db' },
                { id: nanoid(), prop: 'border-radius', value: '6px' },
                { id: nanoid(), prop: 'transition', value: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out' },
            ],
            states: {
                focus: [
                    { id: nanoid(), prop: 'outline', value: 'none' },
                    { id: nanoid(), prop: 'border-color', value: '#2563eb' },
                    { id: nanoid(), prop: 'box-shadow', value: '0 0 0 3px rgba(59, 130, 246, 0.3)' },
                ],
            },
            modifiers: [],
        };
        setComponents((prev) => [...prev, newInput]);
    } else if (type === 'selector') {
        const newSelector = {
            id: nanoid(),
            type: 'selector',
            name: 'select',
            styles: [
                { id: nanoid(), prop: 'padding', value: '8px 12px' },
                { id: nanoid(), prop: 'font-size', value: '16px' },
                { id: nanoid(), prop: 'background-color', value: '#f3f4f6' },
                { id: nanoid(), prop: 'color', value: '#111827' },
                { id: nanoid(), prop: 'border', value: '1px solid #d1d5db' },
                { id: nanoid(), prop: 'border-radius', value: '6px' },
                { id: nanoid(), prop: 'appearance', value: 'none' },
            ],
            states: {
                focus: [
                    { id: nanoid(), prop: 'outline', value: 'none' },
                    { id: nanoid(), prop: 'border-color', value: '#2563eb' },
                    { id: nanoid(), prop: 'box-shadow', value: '0 0 0 3px rgba(59, 130, 246, 0.3)' },
                ]
            },
            modifiers: [
                {
                    id: nanoid(),
                    name: 'option',
                    tag: 'option',
                    styles: [
                        { id: nanoid(), prop: 'background-color', value: 'white' },
                        { id: nanoid(), prop: 'color', value: 'black' },
                    ],
                    states: {},
                }
            ],
        };
        setComponents((prev) => [...prev, newSelector]);
    } else if (type === 'textarea') {
      const newTextarea = {
        id: nanoid(),
        type: 'textarea',
        name: 'textarea',
        styles: [
          { id: nanoid(), prop: 'padding', value: '10px 15px' },
          { id: nanoid(), prop: 'font-size', value: '16px' },
          { id: nanoid(), prop: 'line-height', value: '1.5' },
          { id: nanoid(), prop: 'background-color', value: '#f3f4f6' },
          { id: nanoid(), prop: 'color', value: '#111827' },
          { id: nanoid(), prop: 'border', value: '1px solid #d1d5db' },
          { id: nanoid(), prop: 'border-radius', value: '6px' },
          { id: nanoid(), prop: 'resize', value: 'vertical' },
          { id: nanoid(), prop: 'min-height', value: '120px' },
          { id: nanoid(), prop: 'transition', value: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out' },
        ],
        states: {
          focus: [
            { id: nanoid(), prop: 'outline', value: 'none' },
            { id: nanoid(), prop: 'border-color', value: '#2563eb' },
            { id: nanoid(), prop: 'box-shadow', value: '0 0 0 3px rgba(59, 130, 246, 0.3)' },
          ],
        },
        modifiers: [],
      };
      setComponents((prev) => [...prev, newTextarea]);
    } else if (type === 'checkbox') {
        const newCheckbox = {
            id: nanoid(),
            type: 'checkbox',
            name: 'checkbox-wrapper',
            styles: [
                { id: nanoid(), prop: 'display', value: 'inline-flex' },
                { id: nanoid(), prop: 'align-items', value: 'center' },
                { id: nanoid(), prop: 'gap', value: '8px' },
                { id: nanoid(), prop: 'cursor', value: 'pointer' },
            ],
            states: {
                checked: [
                    { id: nanoid(), target: 'box', prop: 'background-color', value: '#2563eb' },
                    { id: nanoid(), target: 'box', prop: 'border-color', value: '#2563eb' },
                    { id: nanoid(), target: 'check', prop: 'opacity', value: '1' },
                    { id: nanoid(), target: 'check', prop: 'transform', value: 'scale(1)' },
                ]
            },
            modifiers: [
                {
                    id: nanoid(),
                    name: 'checkbox-input',
                    tag: 'input',
                    styles: [
                        { id: nanoid(), prop: 'position', value: 'absolute' },
                        { id: nanoid(), prop: 'opacity', value: '0' },
                        { id: nanoid(), prop: 'width', value: '100%' },
                        { id: nanoid(), prop: 'height', value: '100%' },
                        { id: nanoid(), prop: 'cursor', value: 'pointer' },
                    ],
                    states: {},
                },
                {
                    id: nanoid(),
                    name: 'checkbox-box',
                    tag: 'span',
                    styles: [
                        { id: nanoid(), prop: 'width', value: '20px' },
                        { id: nanoid(), prop: 'height', value: '20px' },
                        { id: nanoid(), prop: 'border', value: '2px solid #9ca3af' },
                        { id: nanoid(), prop: 'border-radius', value: '4px' },
                        { id: nanoid(), prop: 'display', value: 'flex' },
                        { id: nanoid(), prop: 'align-items', value: 'center' },
                        { id: nanoid(), prop: 'justify-content', value: 'center' },
                        { id: nanoid(), prop: 'transition', value: 'all 0.2s ease-in-out' },
                    ],
                    states: {},
                },
                {
                    id: nanoid(),
                    name: 'checkbox-check',
                    tag: 'span',
                    styles: [
                        { id: nanoid(), prop: 'opacity', value: '0' },
                        { id: nanoid(), prop: 'transform', value: 'scale(0.5)' },
                        { id: nanoid(), prop: 'transition', value: 'all 0.2s ease-in-out' },
                        { id: nanoid(), prop: 'color', value: 'white' },
                    ],
                    states: {},
                }
            ],
        };
        setComponents((prev) => [...prev, newCheckbox]);
    } else if (type === 'radio') {
        const newRadio = {
            id: nanoid(),
            type: 'radio',
            name: 'radio-wrapper',
            styles: [
                { id: nanoid(), prop: 'display', value: 'inline-flex' },
                { id: nanoid(), prop: 'align-items', value: 'center' },
                { id: nanoid(), prop: 'gap', value: '8px' },
                { id: nanoid(), prop: 'cursor', value: 'pointer' },
            ],
            states: {
                checked: [
                    { id: nanoid(), target: 'dot', prop: 'border-color', value: '#2563eb' },
                    { id: nanoid(), target: 'dot-inner', prop: 'opacity', value: '1' },
                    { id: nanoid(), target: 'dot-inner', prop: 'transform', value: 'scale(1)' },
                ]
            },
            modifiers: [
                {
                    id: nanoid(),
                    name: 'radio-input',
                    tag: 'input',
                    styles: [
                        { id: nanoid(), prop: 'position', value: 'absolute' },
                        { id: nanoid(), prop: 'opacity', value: '0' },
                        { id: nanoid(), prop: 'width', value: '100%' },
                        { id: nanoid(), prop: 'height', value: '100%' },
                        { id: nanoid(), prop: 'cursor', value: 'pointer' },
                    ],
                    states: {},
                },
                {
                    id: nanoid(),
                    name: 'radio-dot',
                    tag: 'span',
                    styles: [
                        { id: nanoid(), prop: 'width', value: '20px' },
                        { id: nanoid(), prop: 'height', value: '20px' },
                        { id: nanoid(), prop: 'border', value: '2px solid #9ca3af' },
                        { id: nanoid(), prop: 'border-radius', value: '50%' },
                        { id: nanoid(), prop: 'display', value: 'flex' },
                        { id: nanoid(), prop: 'align-items', value: 'center' },
                        { id: nanoid(), prop: 'justify-content', value: 'center' },
                        { id: nanoid(), prop: 'transition', value: 'all 0.2s ease-in-out' },
                    ],
                    states: {},
                },
                {
                    id: nanoid(),
                    name: 'radio-dot-inner',
                    tag: 'span',
                    styles: [
                        { id: nanoid(), prop: 'width', value: '10px' },
                        { id: nanoid(), prop: 'height', value: '10px' },
                        { id: nanoid(), prop: 'background-color', value: '#2563eb' },
                        { id: nanoid(), prop: 'border-radius', value: '50%' },
                        { id: nanoid(), prop: 'opacity', value: '0' },
                        { id: nanoid(), prop: 'transform', value: 'scale(0.5)' },
                        { id: nanoid(), prop: 'transition', value: 'all 0.2s ease-in-out' },
                    ],
                    states: {},
                }
            ],
        };
        setComponents((prev) => [...prev, newRadio]);
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

  if (!workspaceLoaded) {
    return <LoadingScreen onSelect={handleWorkspaceSelect} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 shrink-0">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium bg-white border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors">
                All breakpoints
              </button>
              <button className="flex items-center justify-center w-8 h-8 text-sm font-medium bg-white border border-neutral-300 rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-colors">
                +
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="p-2 text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
                  <Search size={16} />
                </button>
                <button className="p-2 text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
                  <Grid2X2 size={16} />
                </button>
              </div>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2 text-sm font-semibold bg-black text-white rounded-md hover:bg-neutral-800 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.2)]"
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
            allColorVariables={allColorVariables}
            allSpacingVariables={allSpacingVariables}
            allTypographyVariables={allTypographyVariables}
            allGlobalVariables={allGlobalVariables}
            colorGroups={colorGroups}
            spacingGroups={spacingGroups}
            typographyGroups={typographyGroups}
            layoutVariableGroups={layoutVariableGroups}
            designVariableGroups={designVariableGroups}
          />
        )}
      </Modal>
    </div>
  );
}

export default App;