// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Type,
  StretchHorizontal,
  Component,
  Layout,
  SquareRadical,
  Text,
  FileText,
  ChevronLeft,
  Brush,
  Info,
} from 'lucide-react';
import InfoModal from './ui/InfoModal';

const navItems = [
  { icon: Palette, label: 'Colors' },
  {
    icon: Type,
    label: 'Typography',
    subItems: [
      { label: 'Type Scales' },
      { label: 'Class Generator', pageId: 'Typography Class Generator' },
      { label: 'Selectors', pageId: 'Typography Selectors' },
      { label: 'Variables', pageId: 'Typography Variables' },
    ],
  },
  {
    icon: StretchHorizontal,
    label: 'Spacing',
    subItems: [
      { label: 'Scales' },
      { label: 'Class Generator' },
      { label: 'Selectors', pageId: 'Spacing Selectors' },
      { label: 'Variables', pageId: 'Spacing Variables' },
    ],
  },
  {
    icon: Layout,
    label: 'Layouts',
    subItems: [
      { label: 'Selectors', pageId: 'Layout Selectors' },
      { label: 'Variables', pageId: 'Layout Variables' },
    ],
  },
  {
    icon: Brush,
    label: 'Design',
    subItems: [
      { label: 'Selectors', pageId: 'Design Selectors' },
      { label: 'Variables', pageId: 'Design Variables' },
    ],
  },
  { icon: Component, label: 'Components' },
  { icon: FileText, label: 'Stylesheets' },
  { icon: Text, label: 'Fonts', disabled: true },
  { icon: SquareRadical, label: 'Other', disabled: true },
];

const bottomNavItems = [
  { icon: Info, label: 'About SkeleKit' },
];

const NavItem = ({ icon: Icon, label, active = false, hasSubMenu = false, disabled = false, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      if (!disabled) {
        onClick();
      }
    }}
    className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      disabled
        ? 'text-neutral-400 cursor-not-allowed'
        : active
        ? 'bg-neutral-100 text-neutral-800'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
    }`}
  >
    <div className="flex items-center gap-3">
      {Icon && <Icon size={18} className={disabled ? 'text-neutral-400' : ''} />}
      <span>{label}</span>
    </div>
    {hasSubMenu && !disabled && (
      <ChevronLeft size={16} className="text-neutral-600 transform rotate-180" />
    )}
  </a>
);

const Sidebar = ({ activePage, onNavigate }) => {
  const [menu, setMenu] = useState('main'); // Can be 'main', 'typography', 'spacing', 'layouts', 'design'
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // --- START OF THE FIX ---
  const handleNavigation = (pageLabel) => {
    const navItem = navItems.find((item) => item.label === pageLabel);
    if (navItem && navItem.subItems && navItem.subItems.length > 0) {
      // Open the submenu view
      setMenu(pageLabel.toLowerCase());
      
      // AND automatically navigate to the first item in that submenu
      const firstSubItem = navItem.subItems[0];
      const targetPage = firstSubItem.pageId || firstSubItem.label;
      onNavigate(targetPage);
    } else {
      // If there's no submenu, just navigate directly
      onNavigate(pageLabel);
    }
  };
  // --- END OF THE FIX ---

  const menuVariants = {
    initial: (direction) => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  const isTypographyActive = [
    'Type Scales',
    'Typography Class Generator',
    'Typography Selectors',
    'Typography Variables',
  ].includes(activePage);
  const isSpacingActive = [
    'Scales',
    'Class Generator',
    'Spacing Selectors',
    'Spacing Variables',
  ].includes(activePage);
  const isLayoutsActive = ['Layout Selectors', 'Layout Variables'].includes(
    activePage
  );
  const isDesignActive = ['Design Selectors', 'Design Variables'].includes(
    activePage
  );

  const renderSubMenu = (menuKey, Icon) => {
    const navItem = navItems.find((i) => i.label.toLowerCase() === menuKey);
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
          <button
            onClick={() => setMenu('main')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 mb-2"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <div className="flex items-center justify-between px-3 mb-1">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {navItem.label}
            </h3>
            {Icon && <Icon size={18} className="text-neutral-500" />}
          </div>
          {navItem.subItems.map((subItem) => (
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
    <aside className="relative w-60 bg-white border-r border-neutral-200 flex flex-col justify-between p-4 shrink-0 overflow-hidden">
      <AnimatePresence
        initial={false}
        custom={menu !== 'main' ? 'forward' : 'backward'}
      >
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
                    (item.label === 'Typography' && isTypographyActive) ||
                    (item.label === 'Spacing' && isSpacingActive) ||
                    (item.label === 'Layouts' && isLayoutsActive) ||
                    (item.label === 'Design' && isDesignActive) ||
                    activePage === item.label
                  }
                  hasSubMenu={!!item.subItems}
                  onClick={() => handleNavigation(item.label)}
                />
              ))}
            </nav>
            <div className="flex flex-col gap-1.5">
              {bottomNavItems.map((item) => (
                <NavItem 
                  key={item.label} 
                  {...item} 
                  onClick={() => setIsInfoModalOpen(true)} 
                />
              ))}
              <div className="text-xs text-neutral-500 px-3 pt-2 space-y-1">
                <div>v 0.1.0 beta</div>
                <div>Built by the Skelementor team</div>
              </div>
            </div>
          </motion.div>
        ) : menu === 'typography' ? (
          renderSubMenu('typography', Type)
        ) : menu === 'spacing' ? (
          renderSubMenu('spacing', StretchHorizontal)
        ) : menu === 'layouts' ? (
          renderSubMenu('layouts', Layout)
        ) : (
          renderSubMenu('design', Brush)
        )}
      </AnimatePresence>
      
      {/* Info Modal */}
      <InfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />
    </aside>
  );
};

export default Sidebar;