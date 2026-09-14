import React, { useState, useCallback } from 'react';
import { VideoData, VideoEditorialProfile, YouTubeMetadata } from './types';
import { analyzeVideoContent } from './services/geminiService';
import VideoInfoForm from './components/VideoInfoForm';
import AnalysisResults from './components/AnalysisResults';
import YouTubePlayerEmbed from './components/YouTubePlayerEmbed';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorAlert from './components/ErrorAlert';
import { Film, Clapperboard, Sparkles, Video, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoData>({
    youtubeUrl: 'https://www.youtube.com/watch?v=bhiS8Z8B7V0',
    title: '',
    description: '',
    transcript: ''
  });

  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [analysis, setAnalysis] = useState<VideoEditorialProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  const handleMetadataLoaded = useCallback((meta: YouTubeMetadata | null) => {
    setMetadata(meta);
  }, []);

  const handleAnalyze = useCallback(async (data: VideoData, meta?: YouTubeMetadata) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setVideoData(data);
    if (meta) {
      setMetadata(meta);
    }

    try {
      const result = await analyzeVideoContent(data, meta || metadata || undefined);
      setAnalysis(result);
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to analyze video editorial attributes. Please verify the URL and try again.');
      }
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [metadata]);

  const handleClear = useCallback(() => {
    setVideoData({ youtubeUrl: '', title: '', description: '', transcript: '' });
    setMetadata(null);
    setAnalysis(null);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
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

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
              <Sparkles className="w-3 h-3 mr-1.5 text-sky-400" />
              Gemini AI Engine
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* Top Input Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl mb-6 backdrop-blur">
          <VideoInfoForm
            initialData={videoData}
            onSubmit={handleAnalyze}
            onClear={handleClear}
            isLoading={isLoading}
            onMetadataLoaded={handleMetadataLoaded}
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
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>YouTube Video Editorial Analyzer • Powered by Gemini 3.8 & Express</p>
          <p className="text-slate-600">Video playback hosted securely via YouTube Embedded API</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
