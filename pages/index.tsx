import { useState, FormEvent, useRef } from 'react';
import Head from 'next/head';
import { get_encoding } from '@dqbd/tiktoken';
import { motion, AnimatePresence } from 'framer-motion';
import { TextScramble } from '@/components/TextScramble';

export default function Home() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!inputText.trim()) return;
    
    try {
      setIsDecoding(true);
      
      // Parse token numbers
      const tokenArray = inputText
        .split(/\s+/)
        .filter(t => t.trim())
        .map(t => {
          const parsed = parseInt(t.trim(), 10);
          if (isNaN(parsed)) {
            throw new Error(`Invalid token: ${t}`);
          }
          return parsed;
        });

      // Decode tokens
      const enc = get_encoding("cl100k_base");
      const bytes = enc.decode(new Uint32Array(tokenArray));
      const text = new TextDecoder().decode(bytes);
      
      setOutputText(text);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to decode tokens');
    } finally {
      setIsDecoding(false);
    }
  };

  const resetDecoder = () => {
    setOutputText('');
    setInputText('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <Head>
        <title>Token Masq</title>
        <meta name="description" content="Transform CL100K_BASE tokens to English text with a sleek animation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="w-full max-w-3xl px-4">
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {!outputText ? (
                <motion.div 
                  key="input"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter tokens..."
                    className="terminal-input"
                    autoFocus
                    disabled={isDecoding}
                  />
                  
                  {error && (
                    <div className="mt-4 text-red-500 text-center">{error}</div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-center py-4 cursor-pointer"
                  onClick={resetDecoder}
                >
                  <TextScramble
                    text={outputText}
                    className="terminal-output"
                    scrambleFactor={24}
                    scrambleSpeed={60}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {isDecoding && (
              <div className="mt-4 text-center text-sm opacity-50">
                Decoding...
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
} 