// src/App.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CSSPreviewPanel, {
  preloadCSSPreviewPanel,
} from './components/CSSPreviewPanel';
import PageRenderer from './components/PageRenderer';
import Modal from './components/ui/Modal';
import ComponentEditor from './components/components/ComponentEditor';
import BreakpointToolbar from './components/breakpoints/BreakpointToolbar';
import BreakpointManagerModal from './components/breakpoints/BreakpointManagerModal';
import { initialClassDefinitions } from './components/spacing/ClassGenerator';
import { initialTypographyClassDefinitions } from './components/typography/TypographyClassGenerator';
import { generateSpacingScale } from './utils/spacingCalculator';
import {
  ALL_BREAKPOINTS_ID,
  DEFAULT_PAGE_VIEWPORT_BY_PAGE,
  buildDefaultBreakpointPresets,
  getActiveBreakpointPresets,
  getBreakpointPresetById,
  getResponsiveCollection,
  isResponsivePage,
  removeResponsiveCollection,
  replaceResponsiveCollection,
} from './utils/breakpoints';
import { migrateWorkspaceData } from './utils/workspaceMigration';
import { nanoid } from 'nanoid';
import LoadingScreen from './pages/LoadingScreen';

const defaultSpacingSettings = {
  namingConvention: 'space', minSize: 16, maxSize: 28, minScaleRatio: 1.25,
  maxScaleRatio: 1.41, baseScaleIndex: 'm', negativeSteps: 4, positiveSteps: 4,
};

const defaultTypographySettings = {
  namingConvention: 'text', minSize: 16, maxSize: 24, minScaleRatio: 1.2,
  maxScaleRatio: 1.33, baseScaleIndex: 'm', negativeSteps: 2, positiveSteps: 5,
};

const LOCAL_STORAGE_KEY = 'skelekit-workspace';
const WORKSPACE_PERSIST_DEBOUNCE_MS = 220;
const loadSkelementorPreset = () => import('./presets/skelementorPreset');

function App() {
  const previewButtonRef = useRef(null);
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
  const [selectorGroupsByBreakpoint, setSelectorGroupsByBreakpoint] = useState({});
  const [variableGroups, setVariableGroups] = useState([]);
  const [variableGroupsByBreakpoint, setVariableGroupsByBreakpoint] = useState({});
  const [layoutSelectorGroups, setLayoutSelectorGroups] = useState([]);
  const [layoutSelectorGroupsByBreakpoint, setLayoutSelectorGroupsByBreakpoint] = useState({});
  const [layoutVariableGroups, setLayoutVariableGroups] = useState([]);
  const [layoutVariableGroupsByBreakpoint, setLayoutVariableGroupsByBreakpoint] = useState({});
  const [designSelectorGroups, setDesignSelectorGroups] = useState([]);
  const [designSelectorGroupsByBreakpoint, setDesignSelectorGroupsByBreakpoint] = useState({});
  const [designVariableGroups, setDesignVariableGroups] = useState([]);
  const [designVariableGroupsByBreakpoint, setDesignVariableGroupsByBreakpoint] = useState({});
  const [breakpointPresets, setBreakpointPresets] = useState(() => buildDefaultBreakpointPresets());
  const [pageViewportByPage, setPageViewportByPage] = useState(
    DEFAULT_PAGE_VIEWPORT_BY_PAGE
  );
  const [isBreakpointManagerOpen, setIsBreakpointManagerOpen] = useState(false);
  const [customCSS, setCustomCSS] = useState('/* Your custom styles go here */');
  const [typographySelectorGroupsByBreakpoint, setTypographySelectorGroupsByBreakpoint] = useState({});
  const [typographyVariableGroupsByBreakpoint, setTypographyVariableGroupsByBreakpoint] = useState({});

  // --- START OF THE FIX: LOCALSTORAGE LOGIC ---

  // Effect to LOAD data from localStorage on initial app startup
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = migrateWorkspaceData(JSON.parse(savedData));
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
        setSelectorGroupsByBreakpoint(parsedData.selectorGroupsByBreakpoint || {});
        setVariableGroups(parsedData.variableGroups || []);
        setVariableGroupsByBreakpoint(parsedData.variableGroupsByBreakpoint || {});
        setLayoutSelectorGroups(parsedData.layoutSelectorGroups || []);
        setLayoutSelectorGroupsByBreakpoint(
          parsedData.layoutSelectorGroupsByBreakpoint || {}
        );
        setLayoutVariableGroups(parsedData.layoutVariableGroups || []);
        setLayoutVariableGroupsByBreakpoint(
          parsedData.layoutVariableGroupsByBreakpoint || {}
        );
        setDesignSelectorGroups(parsedData.designSelectorGroups || []);
        setDesignSelectorGroupsByBreakpoint(
          parsedData.designSelectorGroupsByBreakpoint || {}
        );
        setDesignVariableGroups(parsedData.designVariableGroups || []);
        setDesignVariableGroupsByBreakpoint(
          parsedData.designVariableGroupsByBreakpoint || {}
        );
        setTypographySelectorGroupsByBreakpoint(
          parsedData.typographySelectorGroupsByBreakpoint || {}
        );
        setTypographyVariableGroupsByBreakpoint(
          parsedData.typographyVariableGroupsByBreakpoint || {}
        );
        setBreakpointPresets(
          parsedData.breakpointPresets || buildDefaultBreakpointPresets()
        );
        setPageViewportByPage(
          parsedData.pageViewportByPage || DEFAULT_PAGE_VIEWPORT_BY_PAGE
        );
        setCustomCSS(parsedData.customCSS || '/* Your custom styles go here */');
        
        setWorkspaceLoaded(true); // Bypass the loading screen
      } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []); // Empty array ensures this runs only once on mount

  const workspaceData = useMemo(
    () => ({
      colorGroups,
      activePage,
      isSpacingEnabled,
      spacingGroups,
      generatorConfig,
      isTypographyEnabled,
      typographyGroups,
      typographyGeneratorConfig,
      typographySelectorGroups,
      typographyVariableGroups,
      components,
      selectorGroups,
      selectorGroupsByBreakpoint,
      variableGroups,
      variableGroupsByBreakpoint,
      layoutSelectorGroups,
      layoutSelectorGroupsByBreakpoint,
      layoutVariableGroups,
      layoutVariableGroupsByBreakpoint,
      designSelectorGroups,
      designSelectorGroupsByBreakpoint,
      designVariableGroups,
      designVariableGroupsByBreakpoint,
      customCSS,
      breakpointPresets,
      pageViewportByPage,
      typographySelectorGroupsByBreakpoint,
      typographyVariableGroupsByBreakpoint,
    }),
    [
      colorGroups,
      activePage,
      isSpacingEnabled,
      spacingGroups,
      generatorConfig,
      isTypographyEnabled,
      typographyGroups,
      typographyGeneratorConfig,
      typographySelectorGroups,
      typographyVariableGroups,
      components,
      selectorGroups,
      selectorGroupsByBreakpoint,
      variableGroups,
      variableGroupsByBreakpoint,
      layoutSelectorGroups,
      layoutSelectorGroupsByBreakpoint,
      layoutVariableGroups,
      layoutVariableGroupsByBreakpoint,
      designSelectorGroups,
      designSelectorGroupsByBreakpoint,
      designVariableGroups,
      designVariableGroupsByBreakpoint,
      customCSS,
      breakpointPresets,
      pageViewportByPage,
      typographySelectorGroupsByBreakpoint,
      typographyVariableGroupsByBreakpoint,
    ]
  );

  // Effect to SAVE data to localStorage whenever any state changes
  useEffect(() => {
    if (!workspaceLoaded) {
      return undefined;
    }

    let idleId = null;
    const persistWorkspace = () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workspaceData));
    };

    const timeoutId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(persistWorkspace, {
          timeout: WORKSPACE_PERSIST_DEBOUNCE_MS,
        });
        return;
      }

      persistWorkspace();
    }, WORKSPACE_PERSIST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);

      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [workspaceLoaded, workspaceData]);

  // --- END OF THE FIX ---

  const handleWorkspaceSelect = async (choice) => {
    const defaultBreakpointPresets = buildDefaultBreakpointPresets();
    if (choice === 'preset') {
      const preset = await loadSkelementorPreset();
      const legacySpacingGroups = preset.skelementorSpacingGroups || [];
      const legacyTypographyGroups = preset.skelementorTypographyGroups || [];
      const workspace =
        preset.buildSkelementorPresetWorkspace?.() ||
        preset.skelementorWorkspace || {
          colorGroups: preset.skelementorColorGroups || [],
          isSpacingEnabled: true,
          spacingGroups: legacySpacingGroups,
          isTypographyEnabled: true,
          typographyGroups: legacyTypographyGroups,
          typographySelectorGroups: preset.skelementorTypographySelectorGroups || [],
          typographyVariableGroups: preset.skelementorTypographyVariableGroups || [],
          components: preset.skelementorComponents || [],
          selectorGroups: preset.skelementorSpacingSelectorGroups || [],
          selectorGroupsByBreakpoint: {},
          variableGroups: preset.skelementorSpacingVariableGroups || [],
          variableGroupsByBreakpoint: {},
          layoutSelectorGroups: preset.skelementorLayoutSelectorGroups || [],
          layoutSelectorGroupsByBreakpoint: {},
          layoutVariableGroups: preset.skelementorLayoutVariableGroups || [],
          layoutVariableGroupsByBreakpoint: {},
          designSelectorGroups: preset.skelementorDesignSelectorGroups || [],
          designSelectorGroupsByBreakpoint: {},
          designVariableGroups: preset.skelementorDesignVariableGroups || [],
          designVariableGroupsByBreakpoint: {},
          typographySelectorGroupsByBreakpoint: {},
          typographyVariableGroupsByBreakpoint: {},
          breakpointPresets: defaultBreakpointPresets,
          pageViewportByPage: DEFAULT_PAGE_VIEWPORT_BY_PAGE,
          customCSS:
            preset.skelementorCustomCSS || '/* Your custom styles go here */',
        };

      setColorGroups(workspace.colorGroups || []);
      setSpacingGroups(workspace.spacingGroups || []);
      setTypographyGroups(workspace.typographyGroups || []);
      setDesignVariableGroups(workspace.designVariableGroups || []);
      setComponents(workspace.components || []);
      setIsSpacingEnabled(workspace.isSpacingEnabled || false);
      setIsTypographyEnabled(workspace.isTypographyEnabled || false);
      setGeneratorConfig(
        (workspace.generatorConfig?.length
          ? workspace.generatorConfig
          : null) ||
          initialClassDefinitions.map((definition) => ({
            ...definition,
            enabled: true,
            scaleGroupId: null,
          }))
      );
      setTypographyGeneratorConfig(
        (workspace.typographyGeneratorConfig?.length
          ? workspace.typographyGeneratorConfig
          : null) ||
          initialTypographyClassDefinitions.map((definition) => ({
            ...definition,
            enabled: true,
            scaleGroupId: null,
          }))
      );
      setLayoutVariableGroups(workspace.layoutVariableGroups || []);
      setLayoutSelectorGroups(workspace.layoutSelectorGroups || []);
      setDesignSelectorGroups(workspace.designSelectorGroups || []);
      setTypographySelectorGroups(workspace.typographySelectorGroups || []);
      setTypographyVariableGroups(workspace.typographyVariableGroups || []);
      setSelectorGroups(workspace.selectorGroups || []);
      setVariableGroups(workspace.variableGroups || []);
      setSelectorGroupsByBreakpoint(workspace.selectorGroupsByBreakpoint || {});
      setVariableGroupsByBreakpoint(workspace.variableGroupsByBreakpoint || {});
      setLayoutSelectorGroupsByBreakpoint(
        workspace.layoutSelectorGroupsByBreakpoint || {}
      );
      setLayoutVariableGroupsByBreakpoint(
        workspace.layoutVariableGroupsByBreakpoint || {}
      );
      setDesignSelectorGroupsByBreakpoint(
        workspace.designSelectorGroupsByBreakpoint || {}
      );
      setDesignVariableGroupsByBreakpoint(
        workspace.designVariableGroupsByBreakpoint || {}
      );
      setTypographySelectorGroupsByBreakpoint(
        workspace.typographySelectorGroupsByBreakpoint || {}
      );
      setTypographyVariableGroupsByBreakpoint(
        workspace.typographyVariableGroupsByBreakpoint || {}
      );
      setBreakpointPresets(
        workspace.breakpointPresets || defaultBreakpointPresets
      );
      setPageViewportByPage(
        workspace.pageViewportByPage || DEFAULT_PAGE_VIEWPORT_BY_PAGE
      );
      setCustomCSS(workspace.customCSS || '/* Your custom styles go here */');
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
        setSelectorGroupsByBreakpoint({}); setVariableGroupsByBreakpoint({});
        setLayoutSelectorGroupsByBreakpoint({}); setLayoutVariableGroupsByBreakpoint({});
        setDesignSelectorGroupsByBreakpoint({}); setDesignVariableGroupsByBreakpoint({});
        setTypographySelectorGroupsByBreakpoint({}); setTypographyVariableGroupsByBreakpoint({});
    }
    if (choice !== 'preset') {
      setBreakpointPresets(defaultBreakpointPresets);
      setPageViewportByPage(DEFAULT_PAGE_VIEWPORT_BY_PAGE);
    }
    setWorkspaceLoaded(true);
  };

  const getViewportForPage = (pageId) =>
    pageViewportByPage[pageId] || ALL_BREAKPOINTS_ID;

  const updatePageViewport = (pageId, viewportId) => {
    setPageViewportByPage((prev) => ({
      ...prev,
      [pageId]: viewportId,
    }));
  };

  const applyResponsiveCollectionUpdate = (
    pageId,
    setBaseCollection,
    setCollectionMap,
    updater
  ) => {
    const viewport = getViewportForPage(pageId);
    if (viewport === ALL_BREAKPOINTS_ID) {
      setBaseCollection((prev) => updater(prev));
      return;
    }

    setCollectionMap((prev) =>
      replaceResponsiveCollection(prev, viewport, updater(prev[viewport] || []))
    );
  };

  const buildSelectorGroup = ({
    name,
    selector,
    property = '',
    value = '',
  }) => ({
    id: nanoid(),
    name,
    rules: [
      {
        id: nanoid(),
        selector,
        properties: [{ id: nanoid(), property, value }],
      },
    ],
  });

  const buildVariableGroup = ({ name, variableName, value = '' }) => ({
    id: nanoid(),
    name,
    variables: [
      {
        id: nanoid(),
        name: variableName,
        value,
        mode: 'single',
        minValue: 0,
        maxValue: 0,
      },
    ],
  });

  const clearBreakpointData = (breakpointId) => {
    setSelectorGroupsByBreakpoint((prev) => removeResponsiveCollection(prev, breakpointId));
    setVariableGroupsByBreakpoint((prev) => removeResponsiveCollection(prev, breakpointId));
    setTypographySelectorGroupsByBreakpoint((prev) =>
      removeResponsiveCollection(prev, breakpointId)
    );
    setTypographyVariableGroupsByBreakpoint((prev) =>
      removeResponsiveCollection(prev, breakpointId)
    );
    setLayoutSelectorGroupsByBreakpoint((prev) =>
      removeResponsiveCollection(prev, breakpointId)
    );
    setLayoutVariableGroupsByBreakpoint((prev) =>
      removeResponsiveCollection(prev, breakpointId)
    );
    setDesignSelectorGroupsByBreakpoint((prev) =>
      removeResponsiveCollection(prev, breakpointId)
    );
    setDesignVariableGroupsByBreakpoint((prev) =>
      removeResponsiveCollection(prev, breakpointId)
    );
    setPageViewportByPage((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([pageId, viewportId]) => [
          pageId,
          viewportId === breakpointId ? ALL_BREAKPOINTS_ID : viewportId,
        ])
      )
    );
  };
  
  const allColorVariables = useMemo(() => {
    const alphaSteps = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
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
        if (color.shadowConfig?.enabled) {
          const colorBaseName = color.name.replace(/^--/, '');
          alphaSteps.forEach(step => {
            const varName = `--shadow-${colorBaseName}-${step}`;
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
    const newSteps = Math.max(0, Math.min(25, currentSteps + amount));
    handleUpdateTypographyGroup(groupId, { [key]: newSteps });
  };
  const handleAddTypographySelectorGroup = () =>
    applyResponsiveCollectionUpdate(
      'Typography Selectors',
      setTypographySelectorGroups,
      setTypographySelectorGroupsByBreakpoint,
      (prev) => [
        ...prev,
        buildSelectorGroup({
          name: 'New Type Selector Group',
          selector: '.heading-1',
          property: 'font-size',
          value: 'var(--text-xl)',
        }),
      ]
    );
  const handleUpdateTypographySelectorGroup = (updatedGroup) =>
    applyResponsiveCollectionUpdate(
      'Typography Selectors',
      setTypographySelectorGroups,
      setTypographySelectorGroupsByBreakpoint,
      (prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveTypographySelectorGroup = (id) =>
    applyResponsiveCollectionUpdate(
      'Typography Selectors',
      setTypographySelectorGroups,
      setTypographySelectorGroupsByBreakpoint,
      (prev) => prev.filter((g) => g.id !== id)
    );
  const handleAddTypographyVariableGroup = () =>
    applyResponsiveCollectionUpdate(
      'Typography Variables',
      setTypographyVariableGroups,
      setTypographyVariableGroupsByBreakpoint,
      (prev) => [
        ...prev,
        buildVariableGroup({
          name: 'New Type Variable Group',
          variableName: '--font-weight-bold',
          value: '700',
        }),
      ]
    );
  const handleUpdateTypographyVariableGroup = (updatedGroup) =>
    applyResponsiveCollectionUpdate(
      'Typography Variables',
      setTypographyVariableGroups,
      setTypographyVariableGroupsByBreakpoint,
      (prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveTypographyVariableGroup = (id) =>
    applyResponsiveCollectionUpdate(
      'Typography Variables',
      setTypographyVariableGroups,
      setTypographyVariableGroupsByBreakpoint,
      (prev) => prev.filter((g) => g.id !== id)
    );

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
    const newSteps = Math.max(0, Math.min(25, currentSteps + amount));
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
    applyResponsiveCollectionUpdate(
      'Spacing Selectors',
      setSelectorGroups,
      setSelectorGroupsByBreakpoint,
      (prev) => [
        ...prev,
        buildSelectorGroup({
          name: 'Custom Selector Group',
          selector: '.class-name',
        }),
      ]
    );
  const handleUpdateSelectorGroup = (updatedGroup) =>
    applyResponsiveCollectionUpdate(
      'Spacing Selectors',
      setSelectorGroups,
      setSelectorGroupsByBreakpoint,
      (prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveSelectorGroup = (id) =>
    applyResponsiveCollectionUpdate(
      'Spacing Selectors',
      setSelectorGroups,
      setSelectorGroupsByBreakpoint,
      (prev) => prev.filter((g) => g.id !== id)
    );
  const handleAddVariableGroup = () =>
    applyResponsiveCollectionUpdate(
      'Spacing Variables',
      setVariableGroups,
      setVariableGroupsByBreakpoint,
      (prev) => [
        ...prev,
        buildVariableGroup({
          name: 'Custom Variable Group',
          variableName: '--variable',
        }),
      ]
    );
  const handleUpdateVariableGroup = (updatedGroup) =>
    applyResponsiveCollectionUpdate(
      'Spacing Variables',
      setVariableGroups,
      setVariableGroupsByBreakpoint,
      (prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveVariableGroup = (id) =>
    applyResponsiveCollectionUpdate(
      'Spacing Variables',
      setVariableGroups,
      setVariableGroupsByBreakpoint,
      (prev) => prev.filter((g) => g.id !== id)
    );
  const handleAddLayoutSelectorGroup = () =>
    applyResponsiveCollectionUpdate(
      'Layout Selectors',
      setLayoutSelectorGroups,
      setLayoutSelectorGroupsByBreakpoint,
      (prev) => [
        ...prev,
        buildSelectorGroup({
          name: 'Layout Selector Group',
          selector: '.container',
          property: 'width',
          value: '100%',
        }),
      ]
    );
  const handleUpdateLayoutSelectorGroup = (updatedGroup) =>
    applyResponsiveCollectionUpdate(
      'Layout Selectors',
      setLayoutSelectorGroups,
      setLayoutSelectorGroupsByBreakpoint,
      (prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveLayoutSelectorGroup = (id) =>
    applyResponsiveCollectionUpdate(
      'Layout Selectors',
      setLayoutSelectorGroups,
      setLayoutSelectorGroupsByBreakpoint,
      (prev) => prev.filter((g) => g.id !== id)
    );
  const handleAddLayoutVariableGroup = () =>
    applyResponsiveCollectionUpdate(
      'Layout Variables',
      setLayoutVariableGroups,
      setLayoutVariableGroupsByBreakpoint,
      (prev) => [
        ...prev,
        buildVariableGroup({
          name: 'Layout Variable Group',
          variableName: '--header-height',
          value: '60px',
        }),
      ]
    );
  const handleUpdateLayoutVariableGroup = (updatedGroup) =>
    applyResponsiveCollectionUpdate(
      'Layout Variables',
      setLayoutVariableGroups,
      setLayoutVariableGroupsByBreakpoint,
      (prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveLayoutVariableGroup = (id) =>
    applyResponsiveCollectionUpdate(
      'Layout Variables',
      setLayoutVariableGroups,
      setLayoutVariableGroupsByBreakpoint,
      (prev) => prev.filter((g) => g.id !== id)
    );
  const handleAddDesignSelectorGroup = () =>
    applyResponsiveCollectionUpdate(
      'Design Selectors',
      setDesignSelectorGroups,
      setDesignSelectorGroupsByBreakpoint,
      (prev) => [
        ...prev,
        buildSelectorGroup({
          name: 'Design Selector Group',
          selector: '.button',
          property: 'border-radius',
          value: '8px',
        }),
      ]
    );
  const handleUpdateDesignSelectorGroup = (updatedGroup) =>
    applyResponsiveCollectionUpdate(
      'Design Selectors',
      setDesignSelectorGroups,
      setDesignSelectorGroupsByBreakpoint,
      (prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveDesignSelectorGroup = (id) =>
    applyResponsiveCollectionUpdate(
      'Design Selectors',
      setDesignSelectorGroups,
      setDesignSelectorGroupsByBreakpoint,
      (prev) => prev.filter((g) => g.id !== id)
    );
  const handleAddDesignVariableGroup = () =>
    applyResponsiveCollectionUpdate(
      'Design Variables',
      setDesignVariableGroups,
      setDesignVariableGroupsByBreakpoint,
      (prev) => [
        ...prev,
        buildVariableGroup({
          name: 'Design Variable Group',
          variableName: '--border-radius-md',
          value: '8px',
        }),
      ]
    );
  const handleUpdateDesignVariableGroup = (updatedGroup) =>
    applyResponsiveCollectionUpdate(
      'Design Variables',
      setDesignVariableGroups,
      setDesignVariableGroupsByBreakpoint,
      (prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  const handleRemoveDesignVariableGroup = (id) =>
    applyResponsiveCollectionUpdate(
      'Design Variables',
      setDesignVariableGroups,
      setDesignVariableGroupsByBreakpoint,
      (prev) => prev.filter((g) => g.id !== id)
    );

  const currentViewport = getViewportForPage(activePage);
  const activeBreakpointPreset = getBreakpointPresetById(
    breakpointPresets,
    currentViewport
  );
  const isResponsiveActivePage = isResponsivePage(activePage);
  const isResponsiveEditing =
    isResponsiveActivePage && currentViewport !== ALL_BREAKPOINTS_ID;
  const activeBreakpointPresets = useMemo(
    () => getActiveBreakpointPresets(breakpointPresets),
    [breakpointPresets]
  );

  const responsiveCollections = useMemo(
    () => ({
      responsiveSelectorGroups: getResponsiveCollection(
        selectorGroups,
        selectorGroupsByBreakpoint,
        pageViewportByPage['Spacing Selectors'] || ALL_BREAKPOINTS_ID
      ),
      responsiveVariableGroups: getResponsiveCollection(
        variableGroups,
        variableGroupsByBreakpoint,
        pageViewportByPage['Spacing Variables'] || ALL_BREAKPOINTS_ID
      ),
      responsiveTypographySelectorGroups: getResponsiveCollection(
        typographySelectorGroups,
        typographySelectorGroupsByBreakpoint,
        pageViewportByPage['Typography Selectors'] || ALL_BREAKPOINTS_ID
      ),
      responsiveTypographyVariableGroups: getResponsiveCollection(
        typographyVariableGroups,
        typographyVariableGroupsByBreakpoint,
        pageViewportByPage['Typography Variables'] || ALL_BREAKPOINTS_ID
      ),
      responsiveLayoutSelectorGroups: getResponsiveCollection(
        layoutSelectorGroups,
        layoutSelectorGroupsByBreakpoint,
        pageViewportByPage['Layout Selectors'] || ALL_BREAKPOINTS_ID
      ),
      responsiveLayoutVariableGroups: getResponsiveCollection(
        layoutVariableGroups,
        layoutVariableGroupsByBreakpoint,
        pageViewportByPage['Layout Variables'] || ALL_BREAKPOINTS_ID
      ),
      responsiveDesignSelectorGroups: getResponsiveCollection(
        designSelectorGroups,
        designSelectorGroupsByBreakpoint,
        pageViewportByPage['Design Selectors'] || ALL_BREAKPOINTS_ID
      ),
      responsiveDesignVariableGroups: getResponsiveCollection(
        designVariableGroups,
        designVariableGroupsByBreakpoint,
        pageViewportByPage['Design Variables'] || ALL_BREAKPOINTS_ID
      ),
    }),
    [
      selectorGroups,
      selectorGroupsByBreakpoint,
      variableGroups,
      variableGroupsByBreakpoint,
      typographySelectorGroups,
      typographySelectorGroupsByBreakpoint,
      typographyVariableGroups,
      typographyVariableGroupsByBreakpoint,
      layoutSelectorGroups,
      layoutSelectorGroupsByBreakpoint,
      layoutVariableGroups,
      layoutVariableGroupsByBreakpoint,
      designSelectorGroups,
      designSelectorGroupsByBreakpoint,
      designVariableGroups,
      designVariableGroupsByBreakpoint,
      pageViewportByPage,
    ]
  );
  const {
    responsiveSelectorGroups,
    responsiveVariableGroups,
    responsiveTypographySelectorGroups,
    responsiveTypographyVariableGroups,
    responsiveLayoutSelectorGroups,
    responsiveLayoutVariableGroups,
    responsiveDesignSelectorGroups,
    responsiveDesignVariableGroups,
  } = responsiveCollections;

  const previewPanelProps = useMemo(
    () => ({
      colorGroups,
      isSpacingEnabled,
      spacingScale,
      spacingGroups,
      isTypographyEnabled,
      typographyScale,
      typographyGroups,
      typographyGeneratorConfig,
      typographySelectorGroups,
      typographySelectorGroupsByBreakpoint,
      typographyVariableGroups,
      typographyVariableGroupsByBreakpoint,
      generatorConfig,
      selectorGroups,
      selectorGroupsByBreakpoint,
      variableGroups,
      variableGroupsByBreakpoint,
      customCSS,
      layoutSelectorGroups,
      layoutSelectorGroupsByBreakpoint,
      layoutVariableGroups,
      layoutVariableGroupsByBreakpoint,
      designSelectorGroups,
      designSelectorGroupsByBreakpoint,
      designVariableGroups,
      designVariableGroupsByBreakpoint,
      breakpointPresets,
    }),
    [
      colorGroups,
      isSpacingEnabled,
      spacingScale,
      spacingGroups,
      isTypographyEnabled,
      typographyScale,
      typographyGroups,
      typographyGeneratorConfig,
      typographySelectorGroups,
      typographySelectorGroupsByBreakpoint,
      typographyVariableGroups,
      typographyVariableGroupsByBreakpoint,
      generatorConfig,
      selectorGroups,
      selectorGroupsByBreakpoint,
      variableGroups,
      variableGroupsByBreakpoint,
      customCSS,
      layoutSelectorGroups,
      layoutSelectorGroupsByBreakpoint,
      layoutVariableGroups,
      layoutVariableGroupsByBreakpoint,
      designSelectorGroups,
      designSelectorGroupsByBreakpoint,
      designVariableGroups,
      designVariableGroupsByBreakpoint,
      breakpointPresets,
    ]
  );

  const handleToggleBreakpointPreset = (presetId) => {
    setBreakpointPresets((prev) =>
      prev.map((preset) => {
        if (preset.id !== presetId) {
          return preset;
        }

        if (preset.isDefault) {
          return preset;
        }

        const nextIsActive = !preset.isActive;
        if (!nextIsActive) {
          clearBreakpointData(preset.id);
        }

        return {
          ...preset,
          isActive: nextIsActive,
        };
      })
    );
  };

  if (!workspaceLoaded) {
    return <LoadingScreen onSelect={handleWorkspaceSelect} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="shrink-0 border-b border-neutral-200 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              {isResponsiveActivePage ? (
                <BreakpointToolbar
                  presets={activeBreakpointPresets}
                  selectedViewport={currentViewport}
                  selectedPreset={activeBreakpointPreset}
                  onSelectViewport={(viewportId) =>
                    updatePageViewport(activePage, viewportId)
                  }
                  onOpenManager={() => setIsBreakpointManagerOpen(true)}
                />
              ) : (
                <div className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-500">
                  Breakpoints available on selector and variable pages
                </div>
              )}
            </div>
            <div className="flex w-full items-center justify-end lg:w-auto">
              <button
                ref={previewButtonRef}
                onMouseEnter={preloadCSSPreviewPanel}
                onFocus={preloadCSSPreviewPanel}
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 sm:w-auto"
              >
                Export
              </button>
            </div>
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
            typographySelectorGroups={responsiveTypographySelectorGroups}
            onAddTypographySelectorGroup={handleAddTypographySelectorGroup}
            onUpdateTypographySelectorGroup={handleUpdateTypographySelectorGroup}
            onRemoveTypographySelectorGroup={handleRemoveTypographySelectorGroup}
            typographyVariableGroups={responsiveTypographyVariableGroups}
            onAddTypographyVariableGroup={handleAddTypographyVariableGroup}
            onUpdateTypographyVariableGroup={handleUpdateTypographyVariableGroup}
            onRemoveTypographyVariableGroup={handleRemoveTypographyVariableGroup}
            typographyScale={typographyScale}
            generatorConfig={generatorConfig}
            onGeneratorChange={handleGeneratorChange}
            onAddClass={handleAddClass}
            onRemoveClass={handleRemoveClass}
            selectorGroups={responsiveSelectorGroups}
            onAddSelectorGroup={handleAddSelectorGroup}
            onUpdateSelectorGroup={handleUpdateSelectorGroup}
            onRemoveSelectorGroup={handleRemoveSelectorGroup}
            variableGroups={responsiveVariableGroups}
            onAddVariableGroup={handleAddVariableGroup}
            onUpdateVariableGroup={handleUpdateVariableGroup}
            onRemoveVariableGroup={handleRemoveVariableGroup}
            customCSS={customCSS}
            setCustomCSS={setCustomCSS}
            layoutSelectorGroups={responsiveLayoutSelectorGroups}
            onAddLayoutSelectorGroup={handleAddLayoutSelectorGroup}
            onUpdateLayoutSelectorGroup={handleUpdateLayoutSelectorGroup}
            onRemoveLayoutSelectorGroup={handleRemoveLayoutSelectorGroup}
            layoutVariableGroups={responsiveLayoutVariableGroups}
            onAddLayoutVariableGroup={handleAddLayoutVariableGroup}
            onUpdateLayoutVariableGroup={handleUpdateLayoutVariableGroup}
            onRemoveLayoutVariableGroup={handleRemoveLayoutVariableGroup}
            designSelectorGroups={responsiveDesignSelectorGroups}
            onAddDesignSelectorGroup={handleAddDesignSelectorGroup}
            onUpdateDesignSelectorGroup={handleUpdateDesignSelectorGroup}
            onRemoveDesignSelectorGroup={handleRemoveDesignSelectorGroup}
            designVariableGroups={responsiveDesignVariableGroups}
            onAddDesignVariableGroup={handleAddDesignVariableGroup}
            onUpdateDesignVariableGroup={handleUpdateDesignVariableGroup}
            onRemoveDesignVariableGroup={handleRemoveDesignVariableGroup}
            components={components}
            onAddComponent={handleAddComponent}
            onEditComponent={handleEditComponent}
            currentResponsiveViewport={currentViewport}
            activeBreakpointPreset={activeBreakpointPreset}
            isResponsiveEditing={isResponsiveEditing}
          />
        </div>
      </div>

      <CSSPreviewPanel
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        returnFocusRef={previewButtonRef}
        {...previewPanelProps}
      />
      {isBreakpointManagerOpen && (
        <BreakpointManagerModal
          isOpen={isBreakpointManagerOpen}
          presets={breakpointPresets}
          onClose={() => setIsBreakpointManagerOpen(false)}
          onTogglePreset={handleToggleBreakpointPreset}
        />
      )}
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
