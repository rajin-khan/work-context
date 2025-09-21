// src/components/Header.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';
import logo from '../assets/skelekit.png'; 

const Header = () => {
  return (
    // ** THIS IS THE CHANGE: Added relative and z-40 **
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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md cursor-pointer hover:bg-neutral-800 transition-colors">
          <span className="text-sm text-neutral-200">Hello, rajin!</span>
          <ChevronDown size={16} className="text-neutral-500" />
        </div>
      </div>
    </header>
  );
};

export default Header;