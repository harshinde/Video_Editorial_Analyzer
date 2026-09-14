import React, { useState } from 'react';
import { VideoEditorialProfile, StructuralBeat, MacroPacingPoint } from '../types';
import ShotRhythmChart from './ShotRhythmChart';
import PacingStyleSummaryCard from './PacingStyleSummaryCard';
import { exportToJson, exportToPdf } from '../utils/exportReport';
import {
  Film,
  Zap,
  Clock,
  Layers,
  Palette,
  Volume2,
  Sliders,
  Scissors,
  BookmarkCheck,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Share2,
  Sparkles,
  Music,
  Compass,
  Tag,
  BarChart3,
  TrendingUp,
  Activity,
  Download,
  FileText,
  FileJson,
  ChevronDown
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: VideoEditorialProfile;
  onSeek?: (seconds: number) => void;
  videoTitle?: string;
  creatorName?: string;
}

const BEAT_COLOR_MAP: Record<string, string> = {
  Hook: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  Intro: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Core Content': 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  'Story Arc': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  Montage: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  Climax: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'CTA/Outro': 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  Transition: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  onSeek,
  videoTitle,
  creatorName
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'rhythm_chart' | 'pacing_curve' | 'cutting' | 'visual' | 'audio' | 'blueprint'>(
    'timeline'
  );

  if (!analysis) return null;

  const scopeInfo = analysis.scope_analyzed;
  const hasMacroCurve = Boolean(analysis.macro_pacing_curve && analysis.macro_pacing_curve.length > 0);

  const triggerFeedback = (msg: string) => {
    setDownloadFeedback(msg);
    setTimeout(() => setDownloadFeedback(null), 3500);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setIsDownloadMenuOpen(false);
      // Allow UI to render loading state
      await new Promise(resolve => setTimeout(resolve, 60));
      exportToPdf({ analysis, videoTitle, creatorName });
      triggerFeedback('PDF Report downloaded successfully!');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      triggerFeedback('Error generating PDF report. Please try JSON.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadJson = () => {
    try {
      setIsDownloadMenuOpen(false);
      exportToJson({ analysis, videoTitle, creatorName });
      triggerFeedback('JSON Data exported successfully!');
    } catch (err) {
      console.error('Failed to export JSON:', err);
      triggerFeedback('Error generating JSON export.');
    }
  };

  const handleCopyReport = () => {
    const markdown = `# Video Editorial Analysis
**Editorial Archetype:** ${analysis.editorialArchetype}
**Scope Analyzed:** ${scopeInfo?.label || 'Comprehensive Pass'}
**Estimated Avg Shot Length:** ${analysis.metrics.average_shot_length_seconds}s
**Pacing Score:** ${analysis.metrics.pacing_score}/100 (${analysis.metrics.pacing_classification})
**B-Roll Ratio:** ${analysis.metrics.b_roll_ratio_percent}%

## Narrative Summary
${analysis.narrativeSummary}

## Cutting & Camera Rhythm
- Primary Transitions: ${analysis.cutting_style.primary_transitions.join(', ')}
- Punch-in Zooms: ${analysis.cutting_style.punch_in_zooms_usage}
- Camera Movement: ${analysis.cutting_style.framing_and_camera_movement}

## Visual Identity & Palette
${analysis.visual_identity.color_grade_palette.map(p => `- ${p.name} (${p.hex}): ${p.description}`).join('\n')}
- Lighting: ${analysis.visual_identity.lighting_style}
- Motion Graphics: ${analysis.visual_identity.motion_graphics_and_text}

## Audio Landscape
- Music: ${analysis.audio_landscape.music_tempo_and_genre}
- Sound Design: ${analysis.audio_landscape.sound_design_elements.join(', ')}
- Vocal & Ducking: ${analysis.audio_landscape.vocal_delivery_and_ducking}

## Creator Replication Rules
${analysis.creator_replication_guide.essential_rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Archetype & Narrative Card */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Editorial Archetype
              </span>

              {/* Scope Analyzed Pill */}
              {scopeInfo && (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                  scopeInfo.mode === 'macro'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : scopeInfo.mode === 'custom'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {scopeInfo.mode === 'macro' && <BarChart3 className="w-3 h-3 mr-1" />}
                  {scopeInfo.mode === 'custom' && <Clock className="w-3 h-3 mr-1" />}
                  {scopeInfo.mode === 'hook' && <Zap className="w-3 h-3 mr-1" />}
                  {scopeInfo.label}
                </span>
              )}

              <span className="text-xs text-slate-400">
                {creatorName ? `by ${creatorName}` : 'Deconstructed Profile'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-2">
              {analysis.editorialArchetype}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative">
            {/* Download Report Button with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition flex items-center shadow-md shadow-sky-950/40 border border-sky-500/50 group"
                id="download-report-button"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>Download Report</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-200 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDownloadMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDownloadMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn divide-y divide-slate-800">
                    <div className="px-3 pb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Select Export Format
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={isExportingPdf}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/90 flex items-start space-x-2.5 transition group"
                        id="download-pdf-option"
                      >
                        <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 group-hover:bg-rose-500/30 transition shrink-0 mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center">
                            Printable PDF Report (.pdf)
                            {isExportingPdf && (
                              <span className="ml-1.5 text-[10px] text-sky-400 animate-pulse font-normal">
                                Generating...
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            Multi-page formatted brief with swatches, timeline & replication guide
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadJson}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/90 flex items-start space-x-2.5 transition group"
                        id="download-json-option"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/30 transition shrink-0 mt-0.5">
                          <FileJson className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">Structured Data (.json)</div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            Complete raw schema metrics, shot durations & beat metadata
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Copy Markdown Brief Button */}
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center shadow-sm"
              title="Copy markdown summary to clipboard"
              id="copy-brief-button"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Copied Brief!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  <span>Copy Brief</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Download Feedback Banner / Toast */}
        {downloadFeedback && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadFeedback(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs font-semibold ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {scopeInfo?.sampling_summary && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center">
            <span className="font-semibold text-slate-300 mr-2">Sampling Context:</span>
            <span>{scopeInfo.sampling_summary}</span>
          </div>
        )}

        <div className="mt-4 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
          {analysis.narrativeSummary}
        </div>
      </div>

      {/* Primary Pacing Style Summary Card */}
      <PacingStyleSummaryCard analysis={analysis} />

      {/* High-Level Editorial Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Average Shot Length */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center text-xs font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            Avg. Shot Length
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-sky-300">
              {analysis.metrics.average_shot_length_seconds}s
            </span>
            <span className="text-xs text-slate-400">per cut</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {analysis.metrics.average_shot_length_seconds < 2.5
              ? '⚡ Sub-2.5s rapid retention cadence'
              : analysis.metrics.average_shot_length_seconds < 5.0
              ? '⚖️ Dynamic narrative rhythm'
              : '🎬 Deliberate cinematic lingering'}
          </p>
        </div>

        {/* Pacing Score */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center text-xs font-medium text-slate-400">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Pacing Intensity
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-amber-300">
              {analysis.metrics.pacing_score}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, analysis.metrics.pacing_score))}%` }}
            />
          </div>
        </div>

        {/* B-Roll Ratio */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center text-xs font-medium text-slate-400">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            B-Roll / Cutaways
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-emerald-300">
              ~{analysis.metrics.b_roll_ratio_percent}%
            </span>
            <span className="text-xs text-slate-400">visual inserts</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, analysis.metrics.b_roll_ratio_percent))}%` }}
            />
          </div>
        </div>

        {/* Visual Density */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center text-xs font-medium text-slate-400">
            <Sliders className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            Visual Density
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-lg font-bold text-purple-300 truncate">
              {analysis.metrics.visual_density}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {analysis.metrics.pacing_classification}
          </p>
        </div>
      </div>

      {/* Navigation Tabs for Deep Breakdown */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto pb-1 text-sm font-medium">
        {/* Macro Pacing Curve Tab (if available or macro mode) */}
        {hasMacroCurve && (
          <button
            type="button"
            onClick={() => setActiveTab('pacing_curve')}
            className={`px-3 py-2 rounded-t-lg transition flex items-center shrink-0 ${
              activeTab === 'pacing_curve'
                ? 'bg-slate-900 text-purple-400 border-b-2 border-purple-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-1.5 text-purple-400" />
            Macro Pacing Curve ({analysis.macro_pacing_curve?.length} Checkpoints)
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-2 rounded-t-lg transition flex items-center shrink-0 ${
            activeTab === 'timeline'
              ? 'bg-slate-900 text-sky-400 border-b-2 border-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4 mr-1.5" />
          Structural Timeline ({analysis.structural_timeline?.length || 0} Beats)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rhythm_chart')}
          className={`px-3 py-2 rounded-t-lg transition flex items-center shrink-0 ${
            activeTab === 'rhythm_chart'
              ? 'bg-slate-900 text-sky-400 border-b-2 border-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-1.5 text-sky-400" />
          Cut Rhythm Chart
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cutting')}
          className={`px-3 py-2 rounded-t-lg transition flex items-center shrink-0 ${
            activeTab === 'cutting'
              ? 'bg-slate-900 text-sky-400 border-b-2 border-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scissors className="w-4 h-4 mr-1.5" />
          Cutting & Camera
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visual')}
          className={`px-3 py-2 rounded-t-lg transition flex items-center shrink-0 ${
            activeTab === 'visual'
              ? 'bg-slate-900 text-sky-400 border-b-2 border-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4 mr-1.5" />
          Visual & Color Grade
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audio')}
          className={`px-3 py-2 rounded-t-lg transition flex items-center shrink-0 ${
            activeTab === 'audio'
              ? 'bg-slate-900 text-sky-400 border-b-2 border-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4 mr-1.5" />
          Audio & Sound FX
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('blueprint')}
          className={`px-3 py-2 rounded-t-lg transition flex items-center shrink-0 ${
            activeTab === 'blueprint'
              ? 'bg-slate-900 text-sky-400 border-b-2 border-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookmarkCheck className="w-4 h-4 mr-1.5" />
          Replication Guide
        </button>
      </div>

      {/* Tab: Macro Pacing & Energy Curve */}
      {activeTab === 'pacing_curve' && hasMacroCurve && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-purple-300 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                  Macro Video Energy & Pacing Curve
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Periodic snapshot checkpoints sampled across the video length showing how the creator builds momentum, modulates tension, and times the climax.
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60 font-semibold shrink-0">
                Distributed Sampling
              </span>
            </div>

            {/* Visual Energy Curve Graphic / Horizontal Bars */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
              {analysis.macro_pacing_curve?.map((point: MacroPacingPoint, i: number) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 font-mono">{point.time_window}</div>
                  <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">{point.phase_label}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Energy:</span>
                    <span className="text-xs font-bold font-mono text-purple-300">{point.energy_rating}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        point.energy_rating >= 80 ? 'bg-rose-400' : point.energy_rating >= 50 ? 'bg-purple-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${point.energy_rating}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Snapshot Checkpoint Cards */}
          <div className="space-y-3">
            {analysis.macro_pacing_curve?.map((point: MacroPacingPoint, idx: number) => (
              <div
                key={idx}
                className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 hover:border-purple-800/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center space-x-3 w-full sm:w-auto">
                  {/* Seek button */}
                  <button
                    type="button"
                    onClick={() => onSeek && onSeek(point.startSeconds)}
                    className="px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-800/80 text-xs font-mono font-bold transition flex items-center shrink-0 group shadow-sm"
                    title="Jump to checkpoint in player"
                  >
                    <Play className="w-3 h-3 mr-1 text-purple-400 group-hover:scale-110 transition-transform fill-current" />
                    {point.time_window}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-100">
                        {point.phase_label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        Shot Rhythm: {point.shot_rhythm}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      <span className="text-purple-400 font-medium mr-1.5">Editorial Shift:</span>
                      {point.key_editorial_shift}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Energy Score</span>
                    <span className="text-sm font-mono font-bold text-purple-300">{point.energy_rating} / 100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Interactive Structural Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Shot Duration & Cut Frequency Distribution Bar Chart */}
          {analysis.structural_timeline && analysis.structural_timeline.length > 0 && (
            <ShotRhythmChart
              timeline={analysis.structural_timeline}
              overallAvgShotLength={analysis.metrics.average_shot_length_seconds}
              onSeek={onSeek}
            />
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <span>Click any timestamp to seek the video player directly</span>
            <span>{analysis.structural_timeline?.length || 0} Scene / Beat Segments</span>
          </div>

          <div className="space-y-3">
            {analysis.structural_timeline?.map((beat: StructuralBeat, idx: number) => {
              const badgeStyle = BEAT_COLOR_MAP[beat.beat_type] || 'bg-slate-500/20 text-slate-300 border-slate-500/40';
              return (
                <div
                  key={idx}
                  className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center space-x-3 w-full sm:w-auto">
                    {/* Interactive Timestamp Seek Button */}
                    <button
                      type="button"
                      onClick={() => onSeek && onSeek(beat.startSeconds)}
                      className="px-3 py-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900 text-sky-200 border border-sky-800/80 text-xs font-mono font-bold transition flex items-center shrink-0 group shadow-sm"
                      title="Seek player to this beat"
                    >
                      <Play className="w-3 h-3 mr-1 text-sky-400 group-hover:scale-110 transition-transform fill-current" />
                      {beat.timestamp}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeStyle}`}>
                          {beat.beat_type}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                          {beat.title}
                        </h4>
                      </div>

                      <div className="mt-2 text-xs space-y-1">
                        <p className="text-slate-300">
                          <span className="text-slate-500 font-medium mr-1.5">Visuals:</span>
                          {beat.visual_focus}
                        </p>
                        <p className="text-slate-400">
                          <span className="text-slate-500 font-medium mr-1.5">Audio:</span>
                          {beat.audio_cue}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:max-w-xs text-right self-end sm:self-center shrink-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                      Editorial Technique
                    </span>
                    <span className="text-xs text-sky-300/90 font-medium">
                      {beat.editorial_technique}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dedicated Tab: Cut Rhythm & Shot Duration Distribution */}
      {activeTab === 'rhythm_chart' && (
        <div className="space-y-4">
          <ShotRhythmChart
            timeline={analysis.structural_timeline || []}
            overallAvgShotLength={analysis.metrics.average_shot_length_seconds}
            onSeek={onSeek}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-sky-400 flex items-center">
                <Scissors className="w-3.5 h-3.5 mr-1.5" /> Pacing Modulation
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.cutting_style.shot_rhythm_description}
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1.5" /> Punch-ins & Framing
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.cutting_style.punch_in_zooms_usage}
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center">
                <BookmarkCheck className="w-3.5 h-3.5 mr-1.5" /> Retention Playbook
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {analysis.creator_replication_guide.essential_rules.slice(0, 3).map((rule, idx) => (
                  <li key={idx} className="truncate">{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cutting & Camera Rhythm */}
      {activeTab === 'cutting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-sky-400 flex items-center">
              <Scissors className="w-4 h-4 mr-2" /> Primary Transitions Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.cutting_style.primary_transitions.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Cadence & Rhythm Behavior</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.cutting_style.shot_rhythm_description}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-sky-400 flex items-center">
              <Film className="w-4 h-4 mr-2" /> Punch-in Zooms & Framing
            </h3>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Digital Reframing / Scale Pops</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.cutting_style.punch_in_zooms_usage}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Camera Movement & Focal Setup</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.cutting_style.framing_and_camera_movement}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Visual Identity & Color Grading */}
      {activeTab === 'visual' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
            <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center">
              <Palette className="w-4 h-4 mr-2" /> Inferred Color Palette
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {analysis.visual_identity.color_grade_palette.map((swatch, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2.5 space-y-2 shadow-sm"
                >
                  <div
                    className="w-full h-14 rounded-lg shadow-inner border border-white/10"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div>
                    <div className="font-mono text-xs font-bold text-slate-200">{swatch.hex}</div>
                    <div className="text-[11px] font-semibold text-slate-300 truncate">{swatch.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                      {swatch.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
              <h4 className="text-xs font-semibold text-sky-400 mb-2">Lighting Style</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.visual_identity.lighting_style}
              </p>
            </div>
            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
              <h4 className="text-xs font-semibold text-sky-400 mb-2">Motion Graphics & Typography</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.visual_identity.motion_graphics_and_text}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
            <h4 className="text-xs font-semibold text-sky-400 mb-2">B-Roll Characteristics</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {analysis.visual_identity.b_roll_characteristics}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Audio Landscape */}
      {activeTab === 'audio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-sky-400 flex items-center mb-1">
                <Music className="w-4 h-4 mr-2" /> Music Tempo & Genres
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.audio_landscape.music_tempo_and_genre}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Vocal Delivery & Sidechain Ducking</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.audio_landscape.vocal_delivery_and_ducking}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-sky-400 flex items-center">
              <Volume2 className="w-4 h-4 mr-2" /> Foley & Sound Design Triggers
            </h3>
            <ul className="space-y-2">
              {analysis.audio_landscape.sound_design_elements.map((sfx, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 mr-2 shrink-0" />
                  <span>{sfx}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Predominant Evoked Moods</h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.audio_landscape.inferred_moods.map((mood, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 text-[11px] font-medium border border-slate-700/60"
                  >
                    {mood}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Creator Replication Guide */}
      {activeTab === 'blueprint' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
            <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center">
              <BookmarkCheck className="w-4 h-4 mr-2" /> Essential Rules to Replicate This Style
            </h3>
            <div className="space-y-2.5">
              {analysis.creator_replication_guide.essential_rules.map((rule, i) => (
                <div key={i} className="flex items-start text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <span className="font-bold text-sky-400 font-mono mr-2.5 shrink-0">{i + 1}.</span>
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
              <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Recommended Tools, LUTs & Plugins
              </h4>
              <ul className="space-y-1.5">
                {analysis.creator_replication_guide.recommended_tools_or_fx.map((tool, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 mr-2 shrink-0" />
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
              <h4 className="text-xs font-semibold text-amber-400 mb-2 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Common Pitfalls to Avoid
              </h4>
              <ul className="space-y-1.5">
                {analysis.creator_replication_guide.common_pitfalls_to_avoid.map((pitfall, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 mr-2 shrink-0" />
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Export Report Callout Card */}
          <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 rounded-xl p-5 border border-sky-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-sky-200 flex items-center">
                <Download className="w-4 h-4 mr-2 text-sky-400" />
                Export Complete Production Dossier
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Take this editorial style guide into your NLE (Premiere, DaVinci Resolve, Final Cut) or share with your video editing team.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition flex items-center justify-center shadow-md shadow-sky-950/50"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                {isExportingPdf ? 'Generating PDF...' : 'Download PDF'}
              </button>
              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center justify-center shadow-sm"
              >
                <FileJson className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
