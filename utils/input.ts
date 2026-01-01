import { useState, useEffect } from 'react';

export const useInput = () => {
  const [input, setInput] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false,
    jump: false,
    action: false, // E key
    attack: false, // Left click
    aim: false, // Right click
    mode1: false,
    mode2: false,
    night: false, // N key
    help: false, // H key
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setInput((i) => ({ ...i, forward: true })); break;
        case 'KeyS': setInput((i) => ({ ...i, backward: true })); break;
        case 'KeyA': setInput((i) => ({ ...i, left: true })); break;
        case 'KeyD': setInput((i) => ({ ...i, right: true })); break;
        case 'ShiftLeft': setInput((i) => ({ ...i, shift: true })); break;
        case 'Space': setInput((i) => ({ ...i, jump: true })); break;
        case 'KeyE': setInput((i) => ({ ...i, action: true })); break;
        case 'Digit1': setInput((i) => ({ ...i, mode1: true })); break;
        case 'Digit2': setInput((i) => ({ ...i, mode2: true })); break;
        case 'KeyN': setInput((i) => ({ ...i, night: true })); break;
        case 'KeyH': setInput((i) => ({ ...i, help: true })); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setInput((i) => ({ ...i, forward: false })); break;
        case 'KeyS': setInput((i) => ({ ...i, backward: false })); break;
        case 'KeyA': setInput((i) => ({ ...i, left: false })); break;
        case 'KeyD': setInput((i) => ({ ...i, right: false })); break;
        case 'ShiftLeft': setInput((i) => ({ ...i, shift: false })); break;
        case 'Space': setInput((i) => ({ ...i, jump: false })); break;
        case 'KeyE': setInput((i) => ({ ...i, action: false })); break;
        case 'Digit1': setInput((i) => ({ ...i, mode1: false })); break;
        case 'Digit2': setInput((i) => ({ ...i, mode2: false })); break;
        case 'KeyN': setInput((i) => ({ ...i, night: false })); break;
        case 'KeyH': setInput((i) => ({ ...i, help: false })); break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) setInput((i) => ({ ...i, attack: true }));
      if (e.button === 2) setInput((i) => ({ ...i, aim: true }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) setInput((i) => ({ ...i, attack: false }));
      if (e.button === 2) setInput((i) => ({ ...i, aim: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return input;
};
