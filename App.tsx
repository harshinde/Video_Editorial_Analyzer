import React, { useState, useCallback } from 'react';
import { VideoData, VideoEditorialProfile, YouTubeMetadata } from './types';
import { analyzeVideoContent } from './services/geminiService';
import VideoInfoForm from './components/VideoInfoForm';
import AnalysisResults from './components/AnalysisResults';
import YouTubePlayerEmbed from './components/YouTubePlayerEmbed';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorAlert from './components/ErrorAlert';
import GeminiApiKeyModal from './components/GeminiApiKeyModal';
import { useGeminiKey } from './utils/apiKeyStorage';
import { DEMO_EDITORIAL_ANALYSIS, DEMO_VIDEO_METADATA } from './data/demoEditorialData';
import { Film, Clapperboard, Sparkles, Video, KeyRound, AlertTriangle, Play } from 'lucide-react';

const App: React.FC = () => {
  const { hasKey, maskedKey } = useGeminiKey();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [keyNoticeMessage, setKeyNoticeMessage] = useState<string | null>(null);

  const [videoData, setVideoData] = useState<VideoData>({
    youtubeUrl: DEMO_VIDEO_METADATA.url,
    title: DEMO_VIDEO_METADATA.title,
    description: '',
    transcript: ''
  });

  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(DEMO_VIDEO_METADATA);
  const [analysis, setAnalysis] = useState<VideoEditorialProfile | null>(DEMO_EDITORIAL_ANALYSIS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  const handleMetadataLoaded = useCallback((meta: YouTubeMetadata | null) => {
    setMetadata(meta);
  }, []);

  const handleLoadDemo = useCallback(() => {
    setVideoData({
      youtubeUrl: DEMO_VIDEO_METADATA.url,
      title: DEMO_VIDEO_METADATA.title,
      description: '',
      transcript: ''
    });
    setMetadata(DEMO_VIDEO_METADATA);
    setAnalysis(DEMO_EDITORIAL_ANALYSIS);
    setIsDemoMode(true);
    setError(null);
    setSeekTime(null);
  }, []);

  const handleAnalyze = useCallback(async (data: VideoData, meta?: YouTubeMetadata) => {
    // Check if user has provided a Gemini Key
    if (!hasKey) {
      setKeyNoticeMessage('To analyze new videos outside the preloaded 2-minute demo, please connect your personal Google AI Studio Gemini API key.');
      setIsKeyModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setIsDemoMode(false);
    setVideoData(data);
    if (meta) {
      setMetadata(meta);
    }

    try {
      const result = await analyzeVideoContent(data, meta || metadata || undefined);
      setAnalysis(result);
    } catch (err: any) {
      if (err?.requiresKey) {
        setKeyNoticeMessage(err.message);
        setIsKeyModalOpen(true);
      }
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to analyze video editorial attributes. Please verify the URL and try again.');
      }
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasKey, metadata]);

  const handleClear = useCallback(() => {
    setVideoData({ youtubeUrl: '', title: '', description: '', transcript: '' });
    setMetadata(null);
    setAnalysis(null);
    setIsDemoMode(false);
    setError(null);
    setSeekTime(null);
    setIsLoading(false);
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    setSeekTime(seconds);
    // Scroll smoothly to player if on mobile
    const playerEl = document.getElementById('yt-embed-player');
    if (playerEl && window.innerWidth < 1024) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center">
                YouTube Video Editorial Analyzer
                <span className="hidden sm:inline-flex ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  AI Editorial Suite
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Pacing, shot rhythm, cut frequency, and creator style deconstruction
              </p>
            </div>
          </div>

          {/* Add Gemini Key Button in Top Header */}
          <div className="flex items-center space-x-3">
            {!hasKey ? (
              <button
                type="button"
                onClick={() => {
                  setKeyNoticeMessage(null);
                  setIsKeyModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 shadow-lg shadow-amber-950/40 transition flex items-center group animate-pulse"
                id="header-add-gemini-key-btn"
                title="Add your Gemini API Key to run analyses"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>Add Gemini Key</span>
                <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                  Required
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setKeyNoticeMessage(null);
                  setIsKeyModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-200 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 transition flex items-center group shadow-sm"
                id="header-gemini-key-active-btn"
                title="Click to view, update, or remove your Gemini API key"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Gemini Key:</span>
                <span className="sm:hidden">Key:</span>
                <span className="ml-1.5 font-mono text-[11px] text-emerald-300 font-bold">
                  {maskedKey}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* Prominent Gemini Key Required Warning Banner when no key is set */}
        {!hasKey && (
          <div
            className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900/95 to-amber-950/40 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn"
            id="gemini-key-prompt-banner"
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-amber-200">
                    Interactive Demo Loaded &bull; Gemini API Key Required for Custom Videos
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Live Demo
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  We've preloaded a complete, interactive analysis of the 2-minute <em>Avengers: Endgame Official Trailer</em> below so you can explore shot rhythm barcodes, pacing curves, and creator playbooks. To run analyses on <strong>your own YouTube videos</strong>, connect your free Gemini API key from Google AI Studio.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setKeyNoticeMessage('Please add your Gemini API key to enable editorial style analyses.');
                setIsKeyModalOpen(true);
              }}
              className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-lg shadow-amber-950/50 flex items-center shrink-0 group"
              id="banner-add-gemini-key-btn"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-slate-950 group-hover:rotate-12 transition-transform" />
              Add Gemini Key
            </button>
          </div>
        )}

        {/* Top Input Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl mb-6 backdrop-blur">
          <VideoInfoForm
            initialData={videoData}
            onSubmit={handleAnalyze}
            onClear={handleClear}
            isLoading={isLoading}
            onMetadataLoaded={handleMetadataLoaded}
            onRunDemo={handleLoadDemo}
            onOpenKeyModal={() => {
              setKeyNoticeMessage('Connect your Gemini API Key to enable editorial analysis for your own videos.');
              setIsKeyModalOpen(true);
            }}
          />
        </div>

        {/* Dynamic Interactive Stage */}
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <ErrorAlert
              message={error}
              onClose={() => setError(null)}
              onRetry={() => handleAnalyze(videoData, metadata || undefined)}
            />
          )}

          {/* Loading Animation */}
          {isLoading && <LoadingIndicator />}

          {/* If a video ID is active, show the synchronized player */}
          {metadata?.videoId && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Synchronized Video Player */}
              <div className={`space-y-4 ${analysis ? 'lg:col-span-5 lg:sticky lg:top-24' : 'lg:col-span-12 max-w-3xl mx-auto'}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center">
                      <Video className="w-3.5 h-3.5 mr-1 text-red-500" /> Source Video Monitor
                    </span>
                    {analysis && (
                      <span className="text-[11px] text-sky-400">
                        Click timestamps below to seek
                      </span>
                    )}
                  </div>
                  <YouTubePlayerEmbed
                    videoId={metadata.videoId}
                    seekTime={seekTime}
                    title={metadata.title}
                    authorName={metadata.authorName}
                  />
                </div>

                {!analysis && !isLoading && (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center text-xs text-slate-400">
                    Click <span className="text-sky-400 font-semibold">"Analyze Editorial Styles"</span> above to reveal the full shot rhythm, transition patterns, color palette, and audio breakdown.
                  </div>
                )}
              </div>

              {/* Right Column: In-depth Editorial Analysis Results */}
              {analysis && !isLoading && (
                <div className="lg:col-span-7">
                  <AnalysisResults
                    analysis={analysis}
                    onSeek={handleSeek}
                    videoTitle={metadata?.title}
                    creatorName={metadata?.authorName}
                    isDemoMode={isDemoMode}
                    onOpenKeyModal={() => {
                      setKeyNoticeMessage('Connect your Gemini API Key to analyze your own custom YouTube videos.');
                      setIsKeyModalOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Fallback view if analysis exists but no metadata yet */}
          {!metadata?.videoId && analysis && !isLoading && (
            <div className="max-w-4xl mx-auto">
              <AnalysisResults
                analysis={analysis}
                onSeek={handleSeek}
                videoTitle={videoData.title}
                isDemoMode={isDemoMode}
                onOpenKeyModal={() => {
                  setKeyNoticeMessage('Connect your Gemini API Key to analyze your own custom YouTube videos.');
                  setIsKeyModalOpen(true);
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Gemini API Key Modal Dialog */}
      <GeminiApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        noticeMessage={keyNoticeMessage}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>YouTube Video Editorial Analyzer • Powered by Gemini & Express</p>
          <p className="text-slate-600">Video playback hosted securely via YouTube Embedded API</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
