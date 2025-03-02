import { useState, FormEvent, useRef } from 'react';
import Head from 'next/head';
import { get_encoding } from '@dqbd/tiktoken';
import { motion, AnimatePresence } from 'framer-motion';
import { TextScramble } from '@/components/TextScramble';

export default function Home() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('decode');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!inputText.trim()) return;
    
    try {
      setIsProcessing(true);
      
      // Detect if input is tokens or English text
      const words = inputText.split(/\s+/).filter(t => t.trim());
      const tokenCount = words.filter(t => {
        const parsed = parseInt(t.trim(), 10);
        return !isNaN(parsed);
      }).length;
      
      // If more than 80% of words are numbers, treat as tokens
      const isTokens = tokenCount / words.length > 0.8;
      
      const enc = get_encoding("cl100k_base");
      
      if (isTokens) {
        // Decode tokens to text
        setMode('decode');
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

        const bytes = enc.decode(new Uint32Array(tokenArray));
        const text = new TextDecoder().decode(bytes);
        
        setOutputText(text);
      } else {
        // Encode text to tokens
        setMode('encode');
        const tokens = enc.encode(inputText);
        setOutputText(tokens.join(' '));
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process input');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcessor = () => {
    setOutputText('');
    setInputText('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <>
      <Head>
        <title>Token Masq</title>
        <meta name="description" content="Transform between CL100K_BASE tokens and English text with a sleek animation" />
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
                    placeholder="Enter tokens or English text..."
                    className="terminal-input"
                    autoFocus
                    disabled={isProcessing}
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
                  onClick={resetProcessor}
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
            
            {isProcessing && (
              <div className="mt-4 text-center text-sm opacity-50">
                {mode === 'decode' ? 'Decoding...' : 'Encoding...'}
              </div>
            )}
          </form>
        </div>
        
        {/* Info Icon */}
        <div className="fixed bottom-4 right-4">
          <button 
            onClick={toggleInfo}
            className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center focus:outline-none hover:bg-green-400 transition-colors"
            aria-label="Information"
          >
            i
          </button>
          
          {/* Info Overlay */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-10 right-0 w-64 p-4 bg-black border border-green-500 rounded shadow-lg text-green-500 text-sm"
              >
                <h3 className="font-bold mb-2">About TokenMasq</h3>
                <p className="mb-2">
                  This tool automatically detects and converts between:
                </p>
                <ul className="list-disc pl-5 mb-2">
                  <li>CL100K_BASE tokens → English text</li>
                  <li>English text → CL100K_BASE tokens</li>
                </ul>
                <p>
                  Just enter either format and the tool will automatically detect and convert it.
                </p>
                <button 
                  onClick={toggleInfo}
                  className="absolute top-2 right-2 text-green-500 hover:text-green-400"
                  aria-label="Close"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
} 