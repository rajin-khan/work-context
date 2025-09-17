// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Type, StretchHorizontal, Component, Layout, SquareRadical, Text, FileText, Settings, Wrench, ChevronLeft, Brush } from 'lucide-react';

const navItems = [
  { icon: Palette, label: 'Colors' },
  { icon: Type, label: 'Typography' },
  { 
    icon: StretchHorizontal, 
    label: 'Spacing',
    subItems: [
      { label: 'Scales' },
      { label: 'Class Generator' },
      { label: 'Selectors', pageId: 'Spacing Selectors' },
      { label: 'Variables', pageId: 'Spacing Variables' },
    ]
  },
  { 
    icon: Layout, 
    label: 'Layouts',
    subItems: [
      { label: 'Selectors', pageId: 'Layout Selectors' },
      { label: 'Variables', pageId: 'Layout Variables' },
    ]
  },
  // NEW DESIGN TAB
  { 
    icon: Brush, 
    label: 'Design',
    subItems: [
      { label: 'Selectors', pageId: 'Design Selectors' },
      { label: 'Variables', pageId: 'Design Variables' },
    ]
  },
  { icon: Component, label: 'Components' },
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
  const [menu, setMenu] = useState('main'); // Can be 'main', 'spacing', 'layouts', or 'design'

  const handleNavigation = (pageLabel) => {
    const navItem = navItems.find(item => item.label === pageLabel);
    if (navItem && navItem.subItems) {
      setMenu(pageLabel.toLowerCase());
    } else {
      onNavigate(pageLabel);
    }
  };

  const menuVariants = {
    initial: (direction) => ({ x: direction === 'forward' ? '100%' : '-100%', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction === 'forward' ? '-100%' : '100%', opacity: 0 }),
  };

  const isSpacingActive = ['Scales', 'Class Generator', 'Spacing Selectors', 'Spacing Variables'].includes(activePage);
  const isLayoutsActive = ['Layout Selectors', 'Layout Variables'].includes(activePage);
  const isDesignActive = ['Design Selectors', 'Design Variables'].includes(activePage);

  const renderSubMenu = (menuKey, Icon) => {
    const navItem = navItems.find(i => i.label.toLowerCase() === menuKey);
    if (!navItem) return null;

    return (
        <motion.div
            key={menuKey}
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
                <div className="flex items-center justify-between px-3 mb-1">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{navItem.label}</h3>
                    {Icon && <Icon size={18} className="text-neutral-500" />}
                </div>
                {navItem.subItems.map(subItem => (
                    <NavItem 
                        key={subItem.pageId || subItem.label} 
                        {...subItem} 
                        active={activePage === (subItem.pageId || subItem.label)}
                        onClick={() => onNavigate(subItem.pageId || subItem.label)}
                    />
                ))}
            </nav>
        </motion.div>
    );
  };

  return (
    <aside className="relative w-60 bg-black border-r border-neutral-900 flex flex-col justify-between p-4 shrink-0 overflow-hidden">
      <AnimatePresence initial={false} custom={menu !== 'main' ? 'forward' : 'backward'}>
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
                      active={
                        (item.label === 'Spacing' && isSpacingActive) ||
                        (item.label === 'Layouts' && isLayoutsActive) ||
                        (item.label === 'Design' && isDesignActive) || // Added check for Design
                        activePage === item.label
                      }
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
        ) : menu === 'spacing' ? (
          renderSubMenu('spacing', StretchHorizontal)
        ) : menu === 'layouts' ? (
          renderSubMenu('layouts', Layout)
        ) : (
          renderSubMenu('design', Brush) // Added render for Design
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;