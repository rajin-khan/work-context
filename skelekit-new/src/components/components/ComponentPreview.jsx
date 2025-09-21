// src/components/components/ComponentPreview.jsx
import React, { useEffect, useMemo } from 'react';
import { generateComponentCSS } from '../../utils/componentStyler';
import { nanoid } from 'nanoid';
import clsx from 'clsx';

const ComponentPreview = ({ component }) => {
  // **THE FIX**: Generate a unique ID for this specific preview instance.
  // This ensures its styles will not conflict with any other preview.
  const previewId = useMemo(() => `preview-${nanoid(6)}`, [component.id]);

  // Generate the full, SCOPED CSS using the unique ID
  const componentCSS = useMemo(() => generateComponentCSS(component, previewId), [component, previewId]);

  // Inject and clean up the generated styles in the document's <head>
  useEffect(() => {
    const styleTag = document.createElement('style');
    // The ID now includes the unique previewId to be certain of its uniqueness
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

  // **THE FIX**: The button is wrapped in a div with the unique previewId as a class.
  // This creates the CSS scope, so the generated styles only apply inside this div.
  return (
    <div className={previewId}>
      <button className={previewClasses}>
        Hello World
      </button>
    </div>
  );
};

export default ComponentPreview;