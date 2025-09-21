// src/components/ui/FeatureActivationScreen.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const FeatureActivationScreen = ({ title, description, buttonText, onActivate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        <div className="bg-neutral-950 border-2 border-dashed border-neutral-800 p-12 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-sm text-neutral-400 mb-8">
            {description}
          </p>
          <button
            onClick={onActivate}
            className="flex items-center justify-center w-full px-5 py-3 text-sm font-semibold bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 shadow-[0_0_15px_rgba(147,51,234,0.2)] hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:border-brand/50 hover:bg-neutral-800 hover:text-white transition-all duration-300"
          >
            <Sparkles size={16} className="mr-2 text-brand-light" />
            {buttonText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FeatureActivationScreen;