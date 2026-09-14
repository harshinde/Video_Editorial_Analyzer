import React, { useState, useEffect } from 'react';
import { Film, Sparkles, Scissors, Music, Layers, Palette } from 'lucide-react';

const LOADING_PHRASES = [
  "Retrieving YouTube video stream & subtitle tracks...",
  "Calculating shot frequency and cut velocity...",
  "Analyzing visual density and B-roll ratios...",
  "Deconstructing color grading and lighting atmosphere...",
  "Mapping audio landscape, foley cues, and music tempos...",
  "Synthesizing creator replication rules and structural beats..."
];

const LoadingIndicator: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full my-8 bg-slate-900/90 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-indigo-500/5 to-purple-500/5 animate-pulse pointer-events-none" />

      {/* Animated Orbiting Icons */}
      <div className="relative w-20 h-20 flex items-center justify-center mb-5">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-500/40 animate-spin" />
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
          <Film className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-100 flex items-center">
        <Sparkles className="w-4 h-4 mr-2 text-sky-400" />
        Deconstructing Editorial Attributes
      </h3>
      
      <p className="mt-2 text-xs font-mono text-sky-400 bg-sky-950/80 px-3 py-1.5 rounded-full border border-sky-800/60 max-w-md truncate transition-all">
        {LOADING_PHRASES[phraseIndex]}
      </p>

      <p className="mt-3 text-xs text-slate-400 max-w-sm">
        Our editorial engine is reviewing cut rhythm, camera motion, audio ducking, and narrative pacing.
      </p>
    </div>
  );
};

export default LoadingIndicator;
