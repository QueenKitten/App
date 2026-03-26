import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Send, Loader2, Image as ImageIcon, RefreshCw, Download, Share2, History } from 'lucide-react';
import { generateEmotionalPrompt, generateImageFromPrompt } from './services/gemini';

interface GenerationResult {
  id: string;
  emotions: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export default function App() {
  const [emotions, setEmotions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emotions.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setLoadingStep('Analyzing your emotions...');

    try {
      // Step 1: Generate Prompt
      const prompt = await generateEmotionalPrompt(emotions);
      setLoadingStep('Visualizing the art...');
      
      // Step 2: Generate Image
      const imageUrl = await generateImageFromPrompt(prompt);

      const newResult: GenerationResult = {
        id: Math.random().toString(36).substring(7),
        emotions,
        prompt,
        imageUrl,
        timestamp: Date.now(),
      };

      setCurrentResult(newResult);
      setHistory(prev => [newResult, ...prev]);
      setEmotions('');
    } catch (err) {
      console.error(err);
      setError('Something went wrong while translating your emotions. Please try again.');
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `emovision-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center px-4 py-8 md:py-16">
      <div className="atmosphere" />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-2">
          EmoVision
        </h1>
        <p className="text-white/60 font-light tracking-wide uppercase text-xs md:text-sm">
          Turn your feelings into visual masterpieces
        </p>
      </motion.header>

      <main className="w-full max-w-4xl z-10 flex flex-col gap-8">
        {/* Input Section */}
        <motion.div 
          layout
          className="glass-card p-6 md:p-8"
        >
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="relative">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 block font-mono">
                How are you feeling right now?
              </label>
              <textarea
                value={emotions}
                onChange={(e) => setEmotions(e.target.value)}
                placeholder="Describe your mood, a dream, or a fleeting feeling..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-colors resize-none h-32 custom-scrollbar"
                disabled={isGenerating}
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                  title="View History"
                >
                  <History size={20} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!emotions.trim() || isGenerating}
              className="group relative overflow-hidden bg-white text-black font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>Generate Art</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-4 text-center"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Result Section */}
        <AnimatePresence mode="wait">
          {currentResult && !isGenerating && (
            <motion.div
              key={currentResult.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid md:grid-cols-2 gap-8 items-start"
            >
              <div className="glass-card overflow-hidden group relative aspect-square">
                <img 
                  src={currentResult.imageUrl} 
                  alt="Generated emotional art"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => downloadImage(currentResult.imageUrl)}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3 font-mono">
                    The Emotional Core
                  </h3>
                  <p className="text-white/80 italic font-serif text-lg leading-relaxed">
                    "{currentResult.emotions}"
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3 font-mono">
                    AI Interpretation
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {currentResult.prompt}
                  </p>
                </div>

                <button
                  onClick={() => handleGenerate()}
                  className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors py-4 border border-white/10 rounded-xl hover:bg-white/5"
                >
                  <RefreshCw size={14} />
                  Regenerate Variation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-8 border-t border-white/10">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 font-mono text-center">
                  Your Journey
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {history.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCurrentResult(item);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                        currentResult?.id === item.id ? 'border-orange-500' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto pt-16 text-center text-white/20 text-[10px] uppercase tracking-[0.3em] font-mono">
        Powered by Gemini & Human Emotion
      </footer>
    </div>
  );
}
