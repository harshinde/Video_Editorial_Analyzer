import React, { useState, useEffect, useCallback } from 'react';
import { VideoData, YouTubeMetadata, AnalysisScope, TimeRange } from '../types';
import { fetchYouTubeInfo } from '../services/geminiService';
import { 
  Video, 
  Sparkles, 
  Search, 
  RotateCcw, 
  Film, 
  CheckCircle2, 
  FileText, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  BarChart3,
  Scissors
} from 'lucide-react';

interface VideoInfoFormProps {
  initialData: VideoData;
  onSubmit: (data: VideoData, metadata?: YouTubeMetadata) => void;
  onClear: () => void;
  isLoading: boolean;
  onMetadataLoaded?: (meta: YouTubeMetadata | null) => void;
}

const SAMPLE_VIDEOS = [
  {
    label: "Veritasium (Science Narrative)",
    url: "https://www.youtube.com/watch?v=bhiS8Z8B7V0",
    description: "Deep narrative pacing, dramatic reveals, macro cinematography"
  },
  {
    label: "MKBHD (Cinematic Studio Tech)",
    url: "https://www.youtube.com/watch?v=kY0wU3aZJgA",
    description: "Crisp 8K robotic slider B-roll, clean color grade, tight pacing"
  },
  {
    label: "Vox (Visual Essay Explainer)",
    url: "https://www.youtube.com/watch?v=qE3m_09zT5w",
    description: "Collage animations, newspaper paper-cuts, archival pacing"
  },
  {
    label: "MrBeast (Hyper-Retention Hook)",
    url: "https://www.youtube.com/watch?v=9bqk6ZUsKyA",
    description: "Sub-2 second cuts, visual sound foley, relentless momentum"
  }
];

const VideoInfoForm: React.FC<VideoInfoFormProps> = ({
  initialData,
  onSubmit,
  onClear,
  isLoading,
  onMetadataLoaded
}) => {
  const [url, setUrl] = useState<string>(initialData.youtubeUrl || '');
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [userNotes, setUserNotes] = useState<string>(initialData.userNotes || '');
  const [customTranscript, setCustomTranscript] = useState<string>(initialData.transcript || '');
  
  // Multi-mode Scope state
  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>(initialData.analysisScope || 'hook');
  const [timeRange, setTimeRange] = useState<TimeRange>(initialData.timeRange || { start: '00:00', end: '01:30' });

  // Helper to extract YouTube Video ID
  const parseVideoId = useCallback((input: string): string | null => {
    if (!input) return null;
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      if (parsed.hostname.includes('youtu.be')) {
        const id = parsed.pathname.slice(1).split(/[?#]/)[0];
        if (id && id.length === 11) return id;
      }
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname.startsWith('/shorts/')) {
          const id = parsed.pathname.split('/shorts/')[1]?.split(/[?#]/)[0];
          if (id && id.length === 11) return id;
        }
        if (parsed.pathname.startsWith('/embed/')) {
          const id = parsed.pathname.split('/embed/')[1]?.split(/[?#]/)[0];
          if (id && id.length === 11) return id;
        }
        const v = parsed.searchParams.get('v');
        if (v && v.length === 11) return v;
      }
    } catch {
      const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];
    }
    return null;
  }, []);

  const loadMetadata = useCallback(async (videoUrl: string) => {
    const videoId = parseVideoId(videoUrl);
    if (!videoId) return;

    setIsFetchingInfo(true);
    try {
      const data = await fetchYouTubeInfo(videoUrl);
      setMetadata(data);
      if (onMetadataLoaded) onMetadataLoaded(data);
    } catch (err: any) {
      console.warn('Metadata fetch warning:', err);
      // Fallback metadata so user can still proceed
      const fallbackMeta: YouTubeMetadata = {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: 'YouTube Video',
        authorName: 'YouTube Creator',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      };
      setMetadata(fallbackMeta);
      if (onMetadataLoaded) onMetadataLoaded(fallbackMeta);
    } finally {
      setIsFetchingInfo(false);
    }
  }, [parseVideoId, onMetadataLoaded]);

  // Load metadata when URL changes and looks valid
  useEffect(() => {
    const videoId = parseVideoId(url);
    if (videoId && (!metadata || metadata.videoId !== videoId)) {
      const timer = setTimeout(() => {
        loadMetadata(url);
      }, 350);
      return () => clearTimeout(timer);
    } else if (!url) {
      setMetadata(null);
      if (onMetadataLoaded) onMetadataLoaded(null);
    }
  }, [url, parseVideoId, loadMetadata, metadata, onMetadataLoaded]);

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
    loadMetadata(sampleUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const payload: VideoData = {
      youtubeUrl: url.trim(),
      title: metadata?.title || initialData.title || '',
      description: initialData.description || '',
      transcript: customTranscript || metadata?.transcriptSample || '',
      userNotes: userNotes.trim() || undefined,
      analysisScope,
      timeRange: analysisScope === 'custom' ? timeRange : undefined
    };

    onSubmit(payload, metadata || undefined);
  };

  const handleClear = () => {
    setUrl('');
    setMetadata(null);
    setUserNotes('');
    setCustomTranscript('');
    setAnalysisScope('hook');
    setTimeRange({ start: '00:00', end: '01:30' });
    if (onMetadataLoaded) onMetadataLoaded(null);
    onClear();
  };

  const hasValidVideo = Boolean(parseVideoId(url));

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Main URL Input Box */}
        <div className="relative">
          <label htmlFor="youtube-url-input" className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center">
              <Video className="w-4 h-4 mr-1.5 text-red-500 inline" />
              YouTube Video URL
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Accepts watch URLs, Shorts, or youtu.be links
            </span>
          </label>

          <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden border border-slate-700 bg-slate-900/90 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all">
            <div className="pl-4 text-slate-500 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              id="youtube-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any YouTube video link here (e.g. https://www.youtube.com/watch?v=...)"
              disabled={isLoading}
              className="w-full py-3.5 pl-3 pr-24 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-2 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Sample Suggestions */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center font-medium">
              <Film className="w-3.5 h-3.5 mr-1 text-sky-400" />
              Try Curated Editing Archetypes:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_VIDEOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.url)}
                disabled={isLoading}
                className={`p-2.5 text-left rounded-lg text-xs border transition flex items-center justify-between group ${
                  url === sample.url
                    ? 'bg-sky-950/50 border-sky-500 text-sky-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="truncate mr-2">
                  <div className="font-semibold text-slate-200 group-hover:text-sky-300 transition-colors truncate">
                    {sample.label}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {sample.description}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0 group-hover:bg-sky-900/40 group-hover:text-sky-300">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detected Video Preview Card */}
        {metadata && (
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all">
            <div className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-slate-800 shadow-md">
              <img
                src={metadata.thumbnailUrl}
                alt={metadata.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                <span className="text-[10px] bg-red-600/90 text-white font-semibold px-1.5 py-0.5 rounded flex items-center">
                  <Video className="w-2.5 h-2.5 mr-1 fill-current" /> YouTube
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Video Detected
                </span>
                {metadata.hasTranscript ? (
                  <span className="inline-flex items-center text-[11px] font-medium text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                    <FileText className="w-3 h-3 mr-1" /> Captions Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-medium text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    Visual & Aesthetic Synthesis
                  </span>
                )}
              </div>

              <h4 className="text-sm font-semibold text-slate-100 mt-1.5 truncate">
                {metadata.title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Channel: <span className="text-slate-300 font-medium">{metadata.authorName}</span>
              </p>
            </div>
          </div>
        )}

        {/* ANALYSIS SCOPE SELECTOR (Long-Form Handling) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center">
              <Scissors className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
              Analysis Scope & Video Length Strategy
            </span>
            <span className="text-[11px] text-slate-400">
              Tailor precision for short or 5+ minute videos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode 1: Hook & Retention Pass */}
            <button
              type="button"
              onClick={() => setAnalysisScope('hook')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                analysisScope === 'hook'
                  ? 'bg-sky-950/50 border-sky-500 shadow-md shadow-sky-950'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold flex items-center ${analysisScope === 'hook' ? 'text-sky-300' : 'text-slate-200'}`}>
                    <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
                    Hook Pass
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    0:00 - 1:30
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deconstructs opening retention tactics, visual pattern interrupts, and early payoffs.
                </p>
              </div>
              <div className="mt-2 text-[10px] font-medium text-slate-500">
                Ideal for retention analysis
              </div>
            </button>

            {/* Mode 2: Targeted Scene Window */}
            <button
              type="button"
              onClick={() => setAnalysisScope('custom')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                analysisScope === 'custom'
                  ? 'bg-sky-950/50 border-sky-500 shadow-md shadow-sky-950'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold flex items-center ${analysisScope === 'custom' ? 'text-sky-300' : 'text-slate-200'}`}>
                    <Clock className="w-3.5 h-3.5 mr-1 text-sky-400" />
                    Custom Window
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                    Specific Scene
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Specify an exact time range (e.g., montage sequence or storytelling climax).
                </p>
              </div>
              <div className="mt-2 text-[10px] font-medium text-slate-500">
                User-defined start & end
              </div>
            </button>

            {/* Mode 3: Macro Full-Video Pass */}
            <button
              type="button"
              onClick={() => setAnalysisScope('macro')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                analysisScope === 'macro'
                  ? 'bg-sky-950/50 border-sky-500 shadow-md shadow-sky-950'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold flex items-center ${analysisScope === 'macro' ? 'text-sky-300' : 'text-slate-200'}`}>
                    <BarChart3 className="w-3.5 h-3.5 mr-1 text-purple-400" />
                    Macro Pass
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                    Full Video
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Samples distributed snapshots across the runtime to map macro pacing & energy curves.
                </p>
              </div>
              <div className="mt-2 text-[10px] font-medium text-slate-500">
                Best for long videos (5m+)
              </div>
            </button>
          </div>

          {/* If Custom Window is selected, show time inputs and quick jump presets */}
          {analysisScope === 'custom' && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Set Custom Time Window:</span>
                <span className="text-[11px] text-slate-500">Format: MM:SS or SS</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-400 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={timeRange.start}
                    onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                    placeholder="00:00"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <span className="text-slate-500 pt-5 font-bold">➔</span>

                <div className="flex-1">
                  <label className="block text-[11px] text-slate-400 mb-1">End Time</label>
                  <input
                    type="text"
                    value={timeRange.end}
                    onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                    placeholder="02:00"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[11px] text-slate-500">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => setTimeRange({ start: '00:00', end: '01:00' })}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 hover:text-sky-300 border border-slate-700 transition"
                >
                  First 60s
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange({ start: '02:00', end: '04:00' })}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 hover:text-sky-300 border border-slate-700 transition"
                >
                  Midpoint Montage (2:00 - 4:00)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange({ start: '05:00', end: '07:00' })}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 hover:text-sky-300 border border-slate-700 transition"
                >
                  Climax / Finale (5:00 - 7:00)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Advanced Creator Options */}
        <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <span className="flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Advanced / Custom Creator Notes (Optional)
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-4 pt-2 border-t border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Specific Editing Focus / Questions
                </label>
                <input
                  type="text"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g., Focus on retention editing in the first 30 seconds, or color grading style"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Custom Transcript Override (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customTranscript}
                  onChange={(e) => setCustomTranscript(e.target.value)}
                  placeholder="Paste explicit timestamped transcript or dialogue cues if preferred..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || (!url && !metadata)}
            className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </button>

          <button
            type="submit"
            disabled={isLoading || !hasValidVideo || isFetchingInfo}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading 
              ? (analysisScope === 'macro' 
                  ? 'Calculating Macro Pacing Curve...' 
                  : analysisScope === 'custom' 
                  ? 'Analyzing Target Time Window...' 
                  : 'Deconstructing Retention Style...')
              : (analysisScope === 'macro'
                  ? 'Run Full-Video Macro Pass'
                  : analysisScope === 'custom'
                  ? `Analyze Window (${timeRange.start} – ${timeRange.end})`
                  : 'Analyze Hook & Editorial Styles')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoInfoForm;
