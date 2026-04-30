import React, { memo, useMemo, useState } from 'react';
import { Check, ChevronDown, Minus } from 'lucide-react';
import {
  buildAllExportSelection,
  buildDefaultExportSelection,
  buildRequiredExportSelection,
  getExportSelectionManifest,
  getSelectedExportStats,
} from '../../utils/exportSelection';

const ExportSelectionPanel = memo(({ exportSelection, onExportSelectionChange }) => {
  const manifest = useMemo(() => getExportSelectionManifest(), []);
  const selection = exportSelection || buildAllExportSelection();
  const selectedIds = useMemo(
    () => new Set(selection.selectedUnitIds || []),
    [selection.selectedUnitIds]
  );
  const stats = getSelectedExportStats(selection);
  const [openFamilies, setOpenFamilies] = useState(() =>
    new Set(['Typography', 'Spacing', 'Colors'])
  );

  const unitsByFamily = useMemo(
    () =>
      manifest.families.map((family) => ({
        family,
        units: manifest.units.filter((unit) => unit.family === family),
      })),
    [manifest]
  );

  const emitSelection = (nextIds) => {
    onExportSelectionChange({
      version: manifest.version,
      selectedUnitIds: [...nextIds],
    });
  };

  const toggleUnit = (unitId) => {
    const nextIds = new Set(selectedIds);
    if (nextIds.has(unitId)) {
      nextIds.delete(unitId);
    } else {
      nextIds.add(unitId);
    }
    emitSelection(nextIds);
  };

  const toggleFamily = (familyUnits) => {
    const allSelected = familyUnits.every((unit) => selectedIds.has(unit.id));
    const nextIds = new Set(selectedIds);
    familyUnits.forEach((unit) => {
      if (allSelected) {
        nextIds.delete(unit.id);
      } else {
        nextIds.add(unit.id);
      }
    });
    emitSelection(nextIds);
  };

  const toggleOpenFamily = (family) => {
    setOpenFamilies((previous) => {
      const next = new Set(previous);
      if (next.has(family)) {
        next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  };

  return (
    <section className="flex h-full min-h-0 flex-col border-neutral-200 bg-white lg:border-r">
      <div className="shrink-0 border-b border-neutral-200 px-4 py-4">
        <div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Customize export
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              {stats.selectedClassCount} of {stats.totalClassCount} classes selected
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onExportSelectionChange(buildDefaultExportSelection())}
            className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Default
          </button>
          <button
            type="button"
            onClick={() => onExportSelectionChange(buildAllExportSelection())}
            className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => onExportSelectionChange(buildRequiredExportSelection())}
            className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Required
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
        <div className="space-y-2">
          {unitsByFamily.map(({ family, units }) => {
            const selectedCount = units.filter((unit) =>
              selectedIds.has(unit.id)
            ).length;
            const classCount = units.reduce(
              (total, unit) =>
                selectedIds.has(unit.id)
                  ? total + unit.classNames.length
                  : total,
              0
            );
            const totalClassCount = units.reduce(
              (total, unit) => total + unit.classNames.length,
              0
            );
            const allSelected = selectedCount === units.length;
            const isPartial = selectedCount > 0 && !allSelected;
            const isOpen = openFamilies.has(family);

            return (
              <div key={family} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/80 px-2 py-2">
                  <button
                    type="button"
                    onClick={() => toggleFamily(units)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      allSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : isPartial
                        ? 'border-neutral-500 bg-neutral-100 text-neutral-800'
                        : 'border-neutral-300 bg-white text-transparent'
                    }`}
                    aria-label={`Toggle ${family}`}
                  >
                    {isPartial ? <Minus size={13} /> : <Check size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleOpenFamily(family)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                  >
                    <span className="truncate text-sm font-semibold text-neutral-800">
                      {family}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-neutral-500">
                      {classCount}/{totalClassCount}
                      <ChevronDown
                        size={15}
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <div className="divide-y divide-neutral-100">
                    {units.map((unit) => {
                      const isSelected = selectedIds.has(unit.id);
                      return (
                        <label
                          key={unit.id}
                          className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-neutral-50"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleUnit(unit.id)}
                            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-neutral-700">
                              {unit.label}
                            </span>
                            <span className="block text-xs text-neutral-500">
                              {unit.classNames.length} classes
                              {unit.isOptional ? ' · optional' : ''}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default ExportSelectionPanel;
