// src/components/ColorPickerPopover.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPickerComponent from './ColorPickerComponent';

const VIEWPORT_MARGIN = 12;
const ANCHOR_GAP = 8;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ColorPickerPopover = ({ isOpen, anchorEl, onClose, color, format, onChange }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, isReady: false });
  const pickerRef = useRef(null);
  const frameRef = useRef(null);

  useLayoutEffect(() => {
    if (!isOpen || !anchorEl) {
      setPosition({ top: 0, left: 0, isReady: false });
      return undefined;
    }

    const updatePosition = () => {
      const picker = pickerRef.current;
      if (!picker || !anchorEl.isConnected) {
        return;
      }

      const anchorRect = anchorEl.getBoundingClientRect();
      const pickerRect = picker.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const minLeft = scrollX + VIEWPORT_MARGIN;
      const maxLeft = scrollX + window.innerWidth - VIEWPORT_MARGIN - pickerRect.width;
      const minTop = scrollY + VIEWPORT_MARGIN;
      const maxTop = scrollY + window.innerHeight - VIEWPORT_MARGIN - pickerRect.height;
      const preferredLeft = anchorRect.left + scrollX;
      const belowTop = anchorRect.bottom + scrollY + ANCHOR_GAP;
      const aboveTop = anchorRect.top + scrollY - pickerRect.height - ANCHOR_GAP;

      let top = belowTop;
      if (belowTop + pickerRect.height > scrollY + window.innerHeight - VIEWPORT_MARGIN) {
        if (aboveTop >= minTop) {
          top = aboveTop;
        } else {
          top = clamp(belowTop, minTop, Math.max(minTop, maxTop));
        }
      }

      const left = clamp(preferredLeft, minLeft, Math.max(minLeft, maxLeft));
      setPosition({ top, left, isReady: true });
    };

    const scheduleUpdate = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        updatePosition();
      });
    };

    updatePosition();
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
    };
  }, [isOpen, anchorEl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && pickerRef.current && !pickerRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);
  
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <motion.div
      ref={pickerRef}
      style={{
        top: position.isReady ? position.top : -9999,
        left: position.isReady ? position.left : -9999,
        maxHeight: `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`,
        visibility: position.isReady ? 'visible' : 'hidden',
      }}
      className="absolute z-50"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      <div className="max-h-[calc(100vh-24px)] overflow-y-auto">
        <ColorPickerComponent
          color={color}
          format={format}
          onChange={onChange}
        />
      </div>
    </motion.div>,
    document.body
  );
};

export default ColorPickerPopover;
