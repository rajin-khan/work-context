import React, { memo, useMemo } from 'react';
import { X } from 'lucide-react';
import Input from '../ui/Input';
import { getBreakpointDescription, sortBreakpointsForToolbar } from '../../utils/breakpoints';

const BreakpointManagerModal = memo(({
  isOpen,
  presets,
  onClose,
  onTogglePreset,
}) => {
  const sortedPresets = useMemo(
    () => sortBreakpointsForToolbar(presets),
    [presets]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-3 sm:p-4"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div
          className="my-3 flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-2xl sm:my-0 sm:max-h-[calc(100vh-2rem)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Manage Breakpoints
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Enable the Elementor presets you want available for responsive
                  editing in this workspace.
                </p>
                <p className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                  Breakpoint widths are locked to Elementor’s preset values and
                  can’t be edited here.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="min-h-0 pr-1">
              <div className="space-y-3">
                {sortedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-neutral-900">
                            {preset.label}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-neutral-600">
                          {getBreakpointDescription(preset)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onTogglePreset(preset.id)}
                          disabled={preset.isDefault}
                          className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                            preset.isDefault
                              ? 'cursor-default bg-emerald-100 text-emerald-700'
                              : preset.isActive
                                ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                                : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          {preset.isDefault
                            ? 'Default'
                            : preset.isActive
                              ? 'Disable'
                              : 'Enable'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Min width
                        </label>
                        <Input
                          value={preset.minWidth ?? ''}
                          onChange={() => {}}
                          disabled
                          className="cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 placeholder-neutral-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Max width
                        </label>
                        <Input
                          value={preset.maxWidth ?? ''}
                          onChange={() => {}}
                          disabled
                          className="cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 placeholder-neutral-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BreakpointManagerModal;
