// src/components/Sidebar.jsx
import React from 'react';
import { Palette, Type, StretchHorizontal, Component, Layout, SquareRadical, Text, FileText, Settings, Wrench } from 'lucide-react';

const navItems = [
  { icon: Palette, label: 'Colors', active: true },
  { icon: Type, label: 'Typography' },
  { icon: StretchHorizontal, label: 'Spacing' },
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

const NavItem = ({ icon: Icon, label, active = false }) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </a>
);

const Sidebar = () => {
  return (
    <aside className="w-60 bg-black border-r border-neutral-900 flex flex-col justify-between p-4 shrink-0">
      <nav className="flex flex-col gap-1.5">
        {navItems.map((item) => <NavItem key={item.label} {...item} />)}
      </nav>
      <div className="flex flex-col gap-1.5">
        {bottomNavItems.map((item) => <NavItem key={item.label} {...item} />)}
         <div className="text-xs text-neutral-600 px-3 pt-2">v1.0.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;