// src/components/Header.jsx
import React from 'react';
import { ChevronDown, Trash2, ExternalLink } from 'lucide-react'; // Import Trash2 icon
import logo from '../assets/skelekit-light.png';
import wordpressLogo from '../assets/WordPress-logotype-wmark.png'; 

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
    <header className="relative z-40 flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-white/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="the Editor" className="h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <img src={wordpressLogo} alt="WordPress" className="w-5 h-5" />
          <span>Plugin sync coming soon</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* --- START OF THE FIX --- */}
        <button
          onClick={handleReset}
          title="Reset Workspace"
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-300 rounded-md cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-neutral-600 transition-colors"
        >
          <Trash2 size={14} />
          <span className="text-sm font-medium">Reset</span>
        </button>
        {/* --- END OF THE FIX --- */}
        <a
          href="https://skelementor.mintlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-800 transition-all duration-200"
        >
          <ExternalLink size={14} />
          <span className="text-sm font-medium">Documentation</span>
        </a>
      </div>
    </header>
  );
};

export default Header;