// src/components/Header.jsx
import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react'; // Import Trash2 icon
import logo from '../assets/skelekit.png'; 

const Header = () => {
  // --- START OF THE FIX ---
  // Handler function for the reset button
  const handleReset = () => {
    // Display a confirmation dialog to prevent accidental data loss
    if (window.confirm("Are you sure you want to reset the workspace? This will clear all saved progress and cannot be undone.")) {
      localStorage.removeItem('skelekit-workspace');
      window.location.reload();
    }
  };
  // --- END OF THE FIX ---

  return (
    <header className="relative z-40 flex items-center justify-between px-6 py-3 border-b border-neutral-900 bg-black/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="SkeleKit Logo" className="h-6 w-6" />
          <h1 className="text-xl font-bold tracking-tighter text-white" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            SkeleKit
          </h1>
        </div>
        <nav className="flex items-center gap-6 text-sm text-neutral-400">
          <a href="#" className="hover:text-white transition-colors">Marketplace</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {/* --- START OF THE FIX --- */}
        <button
          onClick={handleReset}
          title="Reset Workspace"
          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md cursor-pointer hover:bg-red-900/50 hover:border-red-500/50 hover:text-red-400 text-neutral-400 transition-colors"
        >
          <Trash2 size={14} />
          <span className="text-sm font-medium">Reset</span>
        </button>
        {/* --- END OF THE FIX --- */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md cursor-pointer hover:bg-neutral-800 transition-colors">
          <span className="text-sm text-neutral-200">Hello, rajin!</span>
          <ChevronDown size={16} className="text-neutral-500" />
        </div>
      </div>
    </header>
  );
};

export default Header;