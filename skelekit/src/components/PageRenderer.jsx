// src/components/PageRenderer.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ColorsPage from '../pages/ColorsPage';
import ScalesPage from '../pages/ScalesPage';
import ClassGeneratorPage from '../pages/ClassGeneratorPage';
import SelectorsPage from '../pages/SelectorsPage';
import VariablesPage from '../pages/VariablesPage';
import StylesheetsPage from '../pages/StylesheetsPage';
import LayoutSelectorsPage from '../pages/LayoutSelectorsPage'; 
import LayoutVariablesPage from '../pages/LayoutVariablesPage'; 
import DesignSelectorsPage from '../pages/DesignSelectorsPage'; // Import new page
import DesignVariablesPage from '../pages/DesignVariablesPage'; // Import new page
import FeatureActivationScreen from './ui/FeatureActivationScreen';

const PageRenderer = (props) => {
  const { activePage, isSpacingEnabled, handleEnableSpacing } = props;

  const renderActivePage = () => {
    switch (activePage) {
      // SPACING SUB-PAGES
      case 'Scales':
        return isSpacingEnabled ? <ScalesPage {...props} /> : (
          <FeatureActivationScreen
            title="Spacing Features Not Enabled"
            description="Activate spacing to generate a fluid, responsive scale and utility classes for your project."
            buttonText="Enable Spacing"
            onActivate={handleEnableSpacing}
          />
        );

      case 'Class Generator':
        return isSpacingEnabled ? <ClassGeneratorPage {...props} /> : (
          <FeatureActivationScreen
            title="Spacing Features Not Enabled"
            description="The Class Generator requires the Scales feature to be active. Activate it to begin creating custom utility classes."
            buttonText="Enable Spacing"
            onActivate={handleEnableSpacing}
          />
        );
        
      case 'Spacing Selectors':
        return isSpacingEnabled ? <SelectorsPage {...props} /> : (
          <FeatureActivationScreen
            title="Spacing Features Not Enabled"
            description="Custom selectors can use variables from your spacing scale. Activate the feature to access them."
            buttonText="Enable Spacing"
            onActivate={handleEnableSpacing}
          />
        );

      case 'Spacing Variables':
        return isSpacingEnabled ? <VariablesPage {...props} /> : (
          <FeatureActivationScreen
            title="Spacing Features Not Enabled"
            description="Custom variables can be created independently, but activating the core feature provides the main spacing variables."
            buttonText="Enable Spacing"
            onActivate={handleEnableSpacing}
          />
        );
      
      // LAYOUT SUB-PAGES
      case 'Layout Selectors':
        return <LayoutSelectorsPage {...props} />;
        
      case 'Layout Variables':
        return <LayoutVariablesPage {...props} />;

      // DESIGN SUB-PAGES (NEW)
      case 'Design Selectors':
        return <DesignSelectorsPage {...props} />;
        
      case 'Design Variables':
        return <DesignVariablesPage {...props} />;

      // OTHER MAIN PAGES
      case 'Stylesheets':
        return <StylesheetsPage {...props} />;

      case 'Colors':
      default:
        return <ColorsPage {...props} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div key={activePage + isSpacingEnabled} className="h-full">
          {renderActivePage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageRenderer;