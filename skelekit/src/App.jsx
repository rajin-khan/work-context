// src/App.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ColorGroup from './components/ColorGroup';
import { Search, Grid2X2 } from 'lucide-react';

function ColorsPage() {
  return (
    <motion.main 
      className="flex-1 p-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ColorGroup />
    </motion.main>
  );
}

function App() {
  return (
    <div className="flex flex-col h-screen bg-black font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-[#050505]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-900">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:bg-neutral-800 transition-colors">All breakpoints</button>
              <button className="flex items-center justify-center w-8 h-8 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">+</button>
            </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"><Search size={16} /></button>
                 <button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"><Grid2X2 size={16} /></button>
               </div>
              <button className="px-4 py-2 text-sm font-semibold bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors">Preview CSS</button>
              <button className="px-4 py-2 text-sm font-semibold bg-brand rounded-md text-white hover:bg-brand-light transition-colors shadow-[0_0_15px_rgba(147,51,234,0.4)]">Save changes</button>
            </div>
          </div>
          <ColorsPage />
        </div>
      </div>
    </div>
  );
}

export default App;