// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Type, StretchHorizontal, Component, Layout, SquareRadical, Text, FileText, Settings, Wrench, ChevronLeft } from 'lucide-react';

const navItems = [
  { icon: Palette, label: 'Colors' },
  { icon: Type, label: 'Typography' },
  { 
    icon: StretchHorizontal, 
    label: 'Spacing',
    subItems: [
      { label: 'Engine & Generator' },
      { label: 'Selectors' },
      { label: 'Variables' },
    ]
  },
  { icon: Component, label: 'Components' },
  { icon: Layout, label: 'Layouts' },
  { icon: Text, label: 'Fonts' },
  { icon: FileText, label: 'Stylesheets' },
  { icon: SquareRadical, label: 'Other' },
];

const bottomNavItems = [
  { icon: Wrench, label: 'Manage project' },
  { icon: Settings, label: 'Preferences' },
];

const NavItem = ({ icon: Icon, label, active = false, hasSubMenu = false, onClick }) => (
  <a
    href="#"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </div>
    {hasSubMenu && <ChevronLeft size={16} className="text-neutral-600 transform rotate-180" />}
  </a>
);

const Sidebar = ({ activePage, onNavigate }) => {
  const [menu, setMenu] = useState('main');

  const handleNavigation = (page) => {
    if (page === 'Spacing') {
      setMenu('spacing');
    } else {
      onNavigate(page);
    }
  };

  const menuVariants = {
    initial: (direction) => ({ x: direction === 'forward' ? '100%' : '-100%', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction === 'forward' ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <aside className="relative w-60 bg-black border-r border-neutral-900 flex flex-col justify-between p-4 shrink-0 overflow-hidden">
      <AnimatePresence initial={false} custom={menu === 'spacing' ? 'forward' : 'backward'}>
        {menu === 'main' ? (
          <motion.div
            key="main"
            custom="backward"
            variants={menuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
            className="absolute top-4 left-4 right-4 flex flex-col justify-between h-[calc(100%-2rem)]"
          >
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => (
                  <NavItem 
                      key={item.label} 
                      {...item}
                      active={item.label === 'Spacing' ? ['Engine & Generator', 'Selectors', 'Variables'].includes(activePage) : activePage === item.label}
                      hasSubMenu={!!item.subItems}
                      onClick={() => handleNavigation(item.label)}
                  />
              ))}
            </nav>
            <div className="flex flex-col gap-1.5">
              {bottomNavItems.map((item) => <NavItem key={item.label} {...item} onClick={() => {}} />)}
              <div className="text-xs text-neutral-600 px-3 pt-2">v1.0.0</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="spacing"
            custom="forward"
            variants={menuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
            className="absolute top-4 left-4 right-4"
          >
            <nav className="flex flex-col gap-1.5">
              <button onClick={() => setMenu('main')} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-white mb-2">
                <ChevronLeft size={16} />
                Back
              </button>
              <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Spacing</h3>
              {navItems.find(i => i.label === 'Spacing').subItems.map(subItem => (
                <NavItem 
                  key={subItem.label} 
                  {...subItem} 
                  active={activePage === subItem.label}
                  onClick={() => onNavigate(subItem.label)}
                />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;