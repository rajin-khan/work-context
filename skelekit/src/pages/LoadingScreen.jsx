// src/pages/LoadingScreen.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { File, Wand2 } from 'lucide-react';
import logo from '../assets/skelekit.png';

const LoadingScreen = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src={logo} alt="SkeleKit Logo" className="h-12 w-12" />
          <h1 className="text-5xl font-bold tracking-tighter">SkeleKit</h1>
        </div>
        <p className="text-neutral-400 max-w-lg mx-auto mb-12">
          The intuitive design system generator. Start from scratch or use a preset to kickstart your project.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <button
            onClick={() => onSelect('blank')}
            className="w-64 h-48 flex flex-col items-center justify-center bg-neutral-950 border border-neutral-800 rounded-xl p-6 text-neutral-400 hover:text-white hover:border-brand transition-all duration-300 group"
          >
            <File size={48} className="mb-4 transition-transform group-hover:scale-110" />
            <h2 className="font-semibold text-lg text-white">Blank Workspace</h2>
            <p className="text-sm">Start with a clean slate.</p>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <button
            onClick={() => onSelect('preset')}
            className="w-64 h-48 flex flex-col items-center justify-center bg-neutral-950 border border-neutral-800 rounded-xl p-6 text-neutral-400 hover:text-white hover:border-brand transition-all duration-300 group"
          >
            <Wand2 size={48} className="mb-4 text-brand-light transition-transform group-hover:scale-110" />
            <h2 className="font-semibold text-lg text-white">Skelementor Preset</h2>
            <p className="text-sm">Load a pre-built theme.</p>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;