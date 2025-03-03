import React, { useState, useEffect, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  className?: string;
  scrambleSpeed?: number;
  scrambleFactor?: number;
  characterSet?: string;
}

export const TextScramble: React.FC<TextScrambleProps> = ({
  text,
  className = '',
  scrambleSpeed = 60,
  scrambleFactor = 24,
  characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>-_\\/[]{}—=+*^?#░▒▓█▄▀■□'
}) => {
  const [displayText, setDisplayText] = useState('');
  const previousTextRef = useRef('');
  const frameRef = useRef<number | null>(null);
  const timeStartRef = useRef<number | null>(null);
  const charactersRef = useRef<{ from: string; to: string; start: number; end: number }[]>([]);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    // Cancel previous animation if running
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    // Setup animation parameters
    const previousText = previousTextRef.current;
    const maxLength = Math.max(previousText.length, text.length);
    
    const chars = [];
    for (let i = 0; i < maxLength; i++) {
      const from = i < previousText.length ? previousText[i] : '';
      const to = i < text.length ? text[i] : '';
      
      // Stagger animation based on character position
      const staggerFactor = Math.min(1, i / 30);
      const randomStart = Math.floor(Math.random() * scrambleFactor * staggerFactor) * scrambleSpeed;
      const start = randomStart + (i * 20);
      
      // Set scramble duration
      const scrambleDuration = scrambleSpeed * (2 + Math.random() * scrambleFactor);
      const end = start + scrambleDuration;
      
      chars.push({ from, to, start, end });
    }
    
    charactersRef.current = chars;
    timeStartRef.current = Date.now();
    
    // Animation frame function
    const update = () => {
      const now = Date.now();
      const elapsed = now - (timeStartRef.current || now);
      let output = '';
      let complete = true;
      
      for (let i = 0, n = charactersRef.current.length; i < n; i++) {
        const { from, to, start, end } = charactersRef.current[i];
        
        if (elapsed > end) {
          output += to;
        } else if (elapsed > start) {
          complete = false;
          
          if (to === ' ' && from === ' ') {
            output += ' ';
          } else {
            // Add randomness with chaos peaking in the middle
            const progress = (elapsed - start) / (end - start);
            const chaosLevel = Math.sin(progress * Math.PI);
            
            if (Math.random() < chaosLevel * 0.7) {
              const charIndex = Math.floor(Math.random() * characterSet.length);
              output += characterSet[charIndex];
            } else {
              output += Math.random() < progress * 0.8 ? to : characterSet[Math.floor(Math.random() * characterSet.length)];
            }
          }
        } else {
          complete = false;
          output += from || '';
        }
      }
      
      setDisplayText(output);
      
      if (!complete) {
        frameRef.current = requestAnimationFrame(update);
      } else {
        setDisplayText(text);
        previousTextRef.current = text;
      }
    };
    
    frameRef.current = requestAnimationFrame(update);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [text, characterSet, scrambleFactor, scrambleSpeed]);

  return <span className={className}>{displayText}</span>;
}; 