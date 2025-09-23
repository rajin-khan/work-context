// src/components/components/ComponentPreview.jsx
import React, { useEffect, useMemo } from 'react';
import { generateComponentStylesheet } from '../../utils/componentStyler'; 
import { nanoid } from 'nanoid';
import clsx from 'clsx';

const ComponentPreview = ({ 
  component,
  colorGroups,
  spacingGroups,
  typographyGroups,
  layoutVariableGroups,
  designVariableGroups,
}) => {
  const previewId = useMemo(() => `preview-${nanoid(6)}`, [component.id]);

  const componentCSS = useMemo(() => generateComponentStylesheet({
    component, 
    previewId,
    colorGroups,
    spacingGroups,
    typographyGroups,
    layoutVariableGroups,
    designVariableGroups
  }), [component, previewId, colorGroups, spacingGroups, typographyGroups, layoutVariableGroups, designVariableGroups]);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.id = `component-preview-styles-${previewId}`;
    styleTag.innerHTML = componentCSS;
    document.head.appendChild(styleTag);

    return () => {
      const existingTag = document.getElementById(styleTag.id);
      if (existingTag) {
        document.head.removeChild(existingTag);
      }
    };
  }, [componentCSS, previewId]);

  const previewClasses = clsx(component.name);

  const renderPreviewElement = () => {
    switch (component.type) {
      case 'input':
        return (
          <input
            className={previewClasses}
            placeholder="Placeholder text..."
          />
        );
      
      case 'dropdown':
        const trigger = component.modifiers?.find(m => m.name === 'trigger');
        const menu = component.modifiers?.find(m => m.name === 'menu');

        return (
          <div className={clsx(previewClasses, 'dropdown-preview-wrapper')}>
            {trigger && React.createElement(
                trigger.tag || 'button', 
                { className: trigger.name }, 
                'Dropdown'
            )}
            {menu && React.createElement(
                menu.tag || 'div', 
                { className: menu.name },
                React.createElement('ul', { style: { listStyle: 'none', margin: 0, padding: '8px' } },
                    React.createElement('li', { style: { padding: '4px 8px', color: '#d1d5db' }}, 'Item 1'),
                    React.createElement('li', { style: { padding: '4px 8px', color: '#d1d5db' }}, 'Item 2')
                )
            )}
          </div>
        );
      
      case 'selector':
        const optionModifier = component.modifiers?.find(m => m.name === 'option');
        const optionClassName = optionModifier ? optionModifier.name : '';
        
        return (
          <select className={previewClasses}>
            <option className={optionClassName}>Option 1</option>
            <option className={optionClassName}>Option 2</option>
            <option className={optionClassName}>Option 3</option>
          </select>
        );

      case 'textarea':
        return (
          <textarea
            className={previewClasses}
            placeholder="Start typing here..."
            rows="4"
          />
        );

      case 'checkbox':
        const inputMod = component.modifiers?.find(m => m.name === 'checkbox-input');
        const boxMod = component.modifiers?.find(m => m.name === 'checkbox-box');
        const checkMod = component.modifiers?.find(m => m.name === 'checkbox-check');
        return (
          <label className={clsx(previewClasses, 'checkbox-preview-wrapper')} style={{ position: 'relative' }}>
            {inputMod && <input type="checkbox" className={inputMod.name} />}
            {boxMod && (
              <span className={boxMod.name}>
                {checkMod && (
                  <span className={checkMod.name}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                )}
              </span>
            )}
            <span style={{ marginLeft: '8px' }}>Checkbox Label</span>
          </label>
        );

      // --- START OF THE FIX ---
      case 'radio':
        const radioInputMod = component.modifiers?.find(m => m.name === 'radio-input');
        const radioDotMod = component.modifiers?.find(m => m.name === 'radio-dot');
        const radioDotInnerMod = component.modifiers?.find(m => m.name === 'radio-dot-inner');
        const radioGroupName = `radio-group-${previewId}`; // Unique name for the group

        const RadioButton = ({ label, defaultChecked = false }) => (
            <label className={clsx(previewClasses, 'radio-preview-wrapper')} style={{ position: 'relative' }}>
                {radioInputMod && <input type="radio" name={radioGroupName} className={radioInputMod.name} defaultChecked={defaultChecked} />}
                {radioDotMod && (
                    <span className={radioDotMod.name}>
                        {radioDotInnerMod && <span className={radioDotInnerMod.name} />}
                    </span>
                )}
                <span style={{ marginLeft: '8px' }}>{label}</span>
            </label>
        );

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <RadioButton label="Option A" defaultChecked={true} />
                <RadioButton label="Option B" />
            </div>
        );
      // --- END OF THE FIX ---
        
      case 'button':
      default:
        return (
          <button className={previewClasses}>
            Hello World
          </button>
        );
    }
  };

  return (
    <div className={previewId}>
      {renderPreviewElement()}
    </div>
  );
};

export default ComponentPreview;