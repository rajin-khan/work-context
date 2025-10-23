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
        <div className="bg-white border-2 border-dashed border-neutral-300 p-12 rounded-xl">
          <h2 className="text-xl font-bold text-neutral-800 mb-2">{title}</h2>
          <p className="text-sm text-neutral-600 mb-8">
            {description}
          </p>
          <button
            onClick={onActivate}
            className="flex items-center justify-center w-full px-5 py-3 text-sm font-semibold bg-white border border-neutral-300 rounded-md text-neutral-700 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:border-brand/50 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-300"
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