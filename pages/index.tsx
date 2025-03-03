import { useState, FormEvent, useRef } from 'react';
import Head from 'next/head';
import { get_encoding } from '@dqbd/tiktoken';
import { motion, AnimatePresence } from 'framer-motion';
import { TextScramble } from '@/components/text-scramble';

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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
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
                    placeholder="Enter AI Tokens or Human English..."
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
        
        {/* Social Icons */}
        <div className="fixed bottom-3 right-3 flex space-x-2">
          {/* GitHub Icon */}
          <a 
            href="https://github.com/Scobel/token-masq"
            target="_blank"
            rel="noopener noreferrer"
            className="w-5 h-5 rounded-full border border-white/20 text-white/50 flex items-center justify-center focus:outline-none hover:text-white/70 hover:border-white/30 transition-colors"
            aria-label="GitHub Repository"
          >
            <i className="fa-brands fa-github text-[10px]"></i>
          </a>
          
          {/* X (Twitter) Icon */}
          <a 
            href="https://www.x.com/scobelverse"
            target="_blank"
            rel="noopener noreferrer"
            className="w-5 h-5 rounded-full border border-white/20 text-white/50 flex items-center justify-center focus:outline-none hover:text-white/70 hover:border-white/30 transition-colors"
            aria-label="X (Twitter) Profile"
          >
            <i className="fa-brands fa-x-twitter text-[10px]"></i>
          </a>
          
          {/* Info Icon */}
          <button 
            onClick={toggleInfo}
            className="w-5 h-5 rounded-full border border-white/20 text-white/50 flex items-center justify-center focus:outline-none hover:text-white/70 hover:border-white/30 transition-colors"
            aria-label="Information"
          >
            <i className="fa-solid fa-info text-[10px]"></i>
          </button>
          
          {/* Info Overlay */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-8 right-0 w-56 p-3 bg-black border border-white/20 rounded shadow-lg text-white/70 text-[10px] leading-tight"
              >
                <p className="mb-1.5">
                  This tool automatically detects and converts between:
                </p>
                <ul className="list-disc pl-4 mb-1.5 space-y-0.5">
                  <li>CL100K_BASE tokens → English text</li>
                  <li>English text → CL100K_BASE tokens</li>
                </ul>
                <p>
                  Just enter either format and the tool will automatically detect and convert it.
                </p>
                <button 
                  onClick={toggleInfo}
                  className="absolute top-1.5 right-1.5 text-white/50 hover:text-white/70 text-[10px]"
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
} 