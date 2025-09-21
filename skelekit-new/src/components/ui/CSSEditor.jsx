// src/components/ui/CSSEditor.jsx
import React, { useRef, useEffect } from 'react';

const CSSEditor = ({ code, setCode }) => {
  const lineNumbersRef = useRef(null);
  const textareaRef = useRef(null);

  // This syncs the scrolling of the line numbers
  // with the scrolling of the text area.
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // This effect runs when the user types, ensuring the line numbers
  // also scroll as new lines are added.
  useEffect(() => {
    handleScroll();
  }, [code]);

  // THIS IS THE NEW FUNCTIONALITY FOR THE TAB KEY
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      // 1. Prevent the default behavior of switching focus
      e.preventDefault();

      const { target } = e;
      const { selectionStart, selectionEnd } = target;

      // 2. Get the current code and insert two spaces at the cursor's position
      const newCode = 
        code.substring(0, selectionStart) + 
        '  ' + // Two spaces for indentation
        code.substring(selectionEnd);

      // 3. Update the state with the new code
      setCode(newCode);

      // 4. Move the cursor to the position after the inserted spaces
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    // The main window frame
    <div className="h-full w-full bg-black rounded-lg border border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
      
      {/* The Title Bar */}
      <div className="flex-shrink-0 h-10 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#f87171] rounded-full"></div>
          <div className="w-3 h-3 bg-[#fbbd23] rounded-full"></div>
          <div className="w-3 h-3 bg-[#4ade80] rounded-full"></div>
        </div>
        <span className="text-sm text-neutral-500 font-mono">custom-styles.css</span>
        <div className="w-12"></div> {/* Spacer */}
      </div>

      {/* The Editor Body */}
      <div className="flex-1 flex relative min-h-0">
        
        {/* Line Numbers Column */}
        <div 
          ref={lineNumbersRef}
          className="w-14 flex-shrink-0 bg-black text-right pr-4 pt-4 text-neutral-600 font-mono text-sm leading-relaxed select-none overflow-hidden"
        >
          {lines.map(num => <div key={num}>{num}</div>)}
        </div>

        {/* The Text Area Itself */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown} // <-- ADD THE KEYDOWN HANDLER HERE
          spellCheck="false"
          className="
            flex-1
            h-full
            resize-none
            border-none
            bg-black
            text-neutral-200
            font-mono
            text-sm
            leading-relaxed
            p-4
            focus:outline-none
            scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent
          "
        />
      </div>
    </div>
  );
};

export default CSSEditor;