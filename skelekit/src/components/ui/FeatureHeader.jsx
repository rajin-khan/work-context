// src/components/ui/FeatureHeader.jsx
import React from 'react';
import { motion } from 'framer-motion';

const FeatureHeader = ({ title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="mb-8 sm:mb-10"
    >
      <h2 className="text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-neutral-600 sm:text-base">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureHeader;
