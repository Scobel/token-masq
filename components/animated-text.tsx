import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export function AnimatedText({ text, className = '' }: AnimatedTextProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  
  useEffect(() => {
    if (text) {
      setIsRevealing(true);
      
      // Set back to false after animation completes
      const timeout = setTimeout(() => {
        setIsRevealing(false);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [text]);

  if (!text) return null;
  
  return (
    <motion.div 
      className={`font-mono text-2xl ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.1,
            delay: index * 0.015,
            ease: "easeOut"
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
} 