// src/components/PageRenderer.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all the pages
import ColorsPage from '../pages/ColorsPage';
import EngineGeneratorPage from '../pages/EngineGeneratorPage';
import SelectorsPage from '../pages/SelectorsPage';
import VariablesPage from '../pages/VariablesPage';

const PageRenderer = (props) => {
  const { activePage } = props;

  const renderActivePage = () => {
    switch (activePage) {
      case 'Engine & Generator':
        return <EngineGeneratorPage {...props} />;
      case 'Selectors':
        return <SelectorsPage {...props} />;
      case 'Variables':
        return <VariablesPage {...props} />;
      case 'Colors':
      default:
        return <ColorsPage {...props} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div key={activePage}>
          {renderActivePage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageRenderer;