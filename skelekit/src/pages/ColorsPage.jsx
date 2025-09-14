// src/pages/ColorsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ColorGroup from '../components/ColorGroup';

const ColorsPage = ({ colors, setColors, groupName, setGroupName }) => {
  return (
    <motion.main
      className="flex-1 p-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ColorGroup
        colors={colors}
        setColors={setColors}
        groupName={groupName}
        setGroupName={setGroupName}
      />
    </motion.main>
  );
};

export default ColorsPage;