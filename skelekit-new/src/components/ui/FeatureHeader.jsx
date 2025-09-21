// src/components/ui/FeatureHeader.jsx
import React from 'react';
import { motion } from 'framer-motion';

const FeatureHeader = ({ title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-10"
    >
      <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
      <p className="text-neutral-400 mt-2 max-w-3xl">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureHeader;