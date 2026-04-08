import React, { memo, useMemo } from 'react';
import { Plus, MonitorSmartphone } from 'lucide-react';
import {
  ALL_BREAKPOINTS_ID,
  buildViewportOptions,
  getBreakpointDescription,
} from '../../utils/breakpoints';

const BreakpointToolbar = memo(({
  presets,
  selectedViewport,
  selectedPreset,
  onSelectViewport,
  onOpenManager,
}) => {
  const viewportOptions = useMemo(() => buildViewportOptions(presets), [presets]);

  return (
    <div className="flex max-w-full flex-wrap items-center gap-2">
      <div className="max-w-full overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm [scrollbar-width:none]">
        <div className="flex min-w-max items-center gap-1.5">
        {viewportOptions.map((option) => {
          const isActive = selectedViewport === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelectViewport(option.id)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? option.id === ALL_BREAKPOINTS_ID
                    ? 'bg-neutral-900 text-white'
                    : 'bg-emerald-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {option.label}
            </button>
          );
        })}
        </div>
      </div>

      <button
        onClick={onOpenManager}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-300 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        title="Manage breakpoints"
      >
        <Plus size={16} />
      </button>

      {selectedPreset && selectedViewport !== ALL_BREAKPOINTS_ID && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <MonitorSmartphone size={15} />
          <span className="font-medium">{selectedPreset.label}</span>
          <span className="text-emerald-700/80">
            {getBreakpointDescription(selectedPreset)}
          </span>
        </div>
      )}
    </div>
  );
});

export default BreakpointToolbar;
