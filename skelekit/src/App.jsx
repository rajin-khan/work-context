// src/App.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ColorGroup from './components/ColorGroup';
import CSSPreviewPanel from './components/CSSPreviewPanel'; // Import the new panel
import { Search, Grid2X2 } from 'lucide-react';

// This component no longer needs to manage state, so we can simplify it
function ColorsPage({ colors, setColors, groupName, setGroupName }) {
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
}

function App() {
  // ** THIS IS THE CHANGE: State is now managed at the top level **
  const [colors, setColors] = useState([]);
  const [groupName, setGroupName] = useState('Untitled');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-black font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden"> {/* Added overflow-hidden */}
        <Sidebar />
        <div className="flex-1 flex flex-col bg-[#050505]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-900 shrink-0">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:bg-neutral-800 transition-colors">All breakpoints</button>
              <button className="flex items-center justify-center w-8 h-8 text-sm font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">+</button>
            </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"><Search size={16} /></button>
                 <button className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"><Grid2X2 size={16} /></button>
               </div>
              {/* ** THIS IS THE CHANGE: Button now controls the slide-out panel ** */}
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2 text-sm font-semibold bg-brand rounded-md text-white hover:bg-brand-light transition-colors shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              >
                Export
              </button>
            </div>
          </div>
          {/* Pass the state down to the page */}
          <ColorsPage 
            colors={colors}
            setColors={setColors}
            groupName={groupName}
            setGroupName={setGroupName}
          />
        </div>
      </div>
      {/* Render the new Preview Panel */}
      <CSSPreviewPanel 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        colors={colors}
        groupName={groupName}
      />
    </div>
  );
}

export default App;