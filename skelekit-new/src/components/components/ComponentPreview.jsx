// src/components/components/ComponentPreview.jsx
import React, { useEffect, useMemo } from 'react';
// THE FIX IS HERE: Import the renamed and upgraded utility function
import { generateComponentStylesheet } from '../../utils/componentStyler'; 
import { nanoid } from 'nanoid';
import clsx from 'clsx';

// THE FIX IS HERE: Accept all the new data props
const ComponentPreview = ({ 
  component,
  colorGroups,
  spacingGroups,
  typographyGroups,
  layoutVariableGroups,
  designVariableGroups,
}) => {
  const previewId = useMemo(() => `preview-${nanoid(6)}`, [component.id]);

  // THE FIX IS HERE: Pass all data to the new stylesheet generator
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

  return (
    <div className={previewId}>
      <button className={previewClasses}>
        Hello World
      </button>
    </div>
  );
};

export default ComponentPreview;