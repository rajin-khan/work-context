// src/pages/StylesheetsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import FeatureHeader from '../components/ui/FeatureHeader';
import CSSEditor from '../components/ui/CSSEditor';

const StylesheetsPage = ({ customCSS, setCustomCSS }) => {
  return (
    <motion.div
      className="p-8 h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FeatureHeader
        title="Custom Stylesheet"
        description="Remove the comment to enable your custom CSS rules here. It will be appended to your final CSS file."
      />
      <div className="flex-1 min-h-0">
        <CSSEditor code={customCSS} setCode={setCustomCSS} />
      </div>
    </motion.div>
  );
};

export default StylesheetsPage;