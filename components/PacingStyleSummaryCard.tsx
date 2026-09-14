import React from 'react';
import { VideoEditorialProfile } from '../types';
import {
  Flame,
  Hourglass,
  Film,
  Sparkles,
  Zap,
  Layers,
  Activity,
  Gauge,
  Volume2,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface PacingStyleSummaryCardProps {
  analysis: VideoEditorialProfile;
}

interface PacingStyleConfig {
  category: 'High-Energy' | 'Documentary' | 'Slow-Burn' | 'Dynamic Explainer';
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  theme: {
    cardBg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    accentText: string;
    pillBg: string;
    pillBorder: string;
  };
  traits: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    detail: string;
  }[];
}

export const getPacingStyleConfig = (analysis: VideoEditorialProfile): PacingStyleConfig => {
  const asl = analysis.metrics.average_shot_length_seconds;
  const score = analysis.metrics.pacing_score;
  const bRoll = analysis.metrics.b_roll_ratio_percent;
  const archetype = (analysis.editorialArchetype || '').toLowerCase();
  const cutsPerMin = Math.round(60 / Math.max(0.8, asl));

  // 1. High-Energy Category
  if (asl <= 2.8 || score >= 75 || archetype.includes('fast') || archetype.includes('retention') || archetype.includes('kinetic')) {
    return {
      category: 'High-Energy',
      title: 'High-Energy / Retention-Driven Pacing',
      tagline: 'Hyper-kinetic editing characterized by rapid cut cadence, frequent pattern interrupts, and sub-3s visual resets engineered to combat audience drop-off.',
      icon: Flame,
      theme: {
        cardBg: 'bg-gradient-to-br from-rose-950/40 via-amber-950/20 to-slate-900/90',
        border: 'border-rose-500/30 hover:border-rose-500/50',
        badgeBg: 'bg-rose-500/20',
        badgeText: 'text-rose-300',
        badgeBorder: 'border-rose-500/40',
        accentText: 'text-rose-400',
        pillBg: 'bg-rose-950/40',
        pillBorder: 'border-rose-800/40'
      },
      traits: [
        {
          icon: Zap,
          label: 'Cut Velocity',
          value: `${asl}s ASL`,
          detail: `~${cutsPerMin} cuts/min (Sub-3s rapid resets)`
        },
        {
          icon: Gauge,
          label: 'Pacing Intensity',
          value: `${score}/100 Rating`,
          detail: analysis.metrics.pacing_classification || 'High momentum'
        },
        {
          icon: Layers,
          label: 'Visual Mix',
          value: `~${bRoll}% Cutaways`,
          detail: 'Frequent B-roll pattern interrupts'
        },
        {
          icon: Volume2,
          label: 'Audio Cadence',
          value: 'Pulsing & Ducked',
          detail: 'Rhythmic audio impacts driving transitions'
        }
      ]
    };
  }

  // 2. Slow-Burn Category
  if (asl >= 6.0 || score <= 45 || archetype.includes('slow') || archetype.includes('meditat') || archetype.includes('contemplat')) {
    return {
      category: 'Slow-Burn',
      title: 'Cinematic Slow-Burn & Immersive Flow',
      tagline: 'Deliberate, unhurried editing featuring long-lingering takes, generous atmospheric breathing room, and deep reliance on natural scene soundscapes.',
      icon: Hourglass,
      theme: {
        cardBg: 'bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/90',
        border: 'border-indigo-500/30 hover:border-indigo-500/50',
        badgeBg: 'bg-indigo-500/20',
        badgeText: 'text-indigo-300',
        badgeBorder: 'border-indigo-500/40',
        accentText: 'text-indigo-400',
        pillBg: 'bg-indigo-950/40',
        pillBorder: 'border-indigo-800/40'
      },
      traits: [
        {
          icon: Clock,
          label: 'Cut Velocity',
          value: `${asl}s ASL`,
          detail: `~${cutsPerMin} cuts/min (Spacious framing)`
        },
        {
          icon: Gauge,
          label: 'Pacing Intensity',
          value: `${score}/100 Rating`,
          detail: 'Patient & measured progression'
        },
        {
          icon: Film,
          label: 'Framing Focus',
          value: 'Atmospheric Lingering',
          detail: 'Allows subjects & environment to mature'
        },
        {
          icon: Volume2,
          label: 'Audio Landscape',
          value: 'Environmental & Foley',
          detail: 'Organic sound design over heavy beat tracks'
        }
      ]
    };
  }

  // 3. Documentary / Visual Essay Category
  if (bRoll >= 40 || archetype.includes('documentary') || archetype.includes('essay') || archetype.includes('investigat')) {
    return {
      category: 'Documentary',
      title: 'Documentary & Visual Essay Rhythm',
      tagline: 'Intellectual and thesis-driven pacing that seamlessly alternates between authoritative talking-head anchors and rich archival/diagrammatic B-roll montages.',
      icon: Film,
      theme: {
        cardBg: 'bg-gradient-to-br from-sky-950/40 via-cyan-950/20 to-slate-900/90',
        border: 'border-sky-500/30 hover:border-sky-500/50',
        badgeBg: 'bg-sky-500/20',
        badgeText: 'text-sky-300',
        badgeBorder: 'border-sky-500/40',
        accentText: 'text-sky-400',
        pillBg: 'bg-sky-950/40',
        pillBorder: 'border-sky-800/40'
      },
      traits: [
        {
          icon: Compass,
          label: 'Narrative Cadence',
          value: `${asl}s ASL`,
          detail: `~${cutsPerMin} cuts/min (Rhythmic balance)`
        },
        {
          icon: Layers,
          label: 'Visual Evidence',
          value: `~${bRoll}% B-Roll`,
          detail: 'Archival footage, diagrams & location inserts'
        },
        {
          icon: Activity,
          label: 'Story Architecture',
          value: 'Thesis & Exploration',
          detail: 'Curiosity loops with escalating complexity'
        },
        {
          icon: Volume2,
          label: 'Vocal Presence',
          value: 'Authoritative Anchor',
          detail: 'Heavy speech compression with vocal clarity'
        }
      ]
    };
  }

  // 4. Dynamic Explainer / Edutainment (Balanced Default)
  return {
    category: 'Dynamic Explainer',
    title: 'Dynamic Explainer & Concept Rhythm',
    tagline: 'Adaptive educational rhythm modulating between punchy hook teasers, kinetic diagram callouts, and clear analytical demonstrations.',
    icon: Sparkles,
    theme: {
      cardBg: 'bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-slate-900/90',
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/40',
      accentText: 'text-emerald-400',
      pillBg: 'bg-emerald-950/40',
      pillBorder: 'border-emerald-800/40'
    },
    traits: [
      {
        icon: Zap,
        label: 'Cut Velocity',
        value: `${asl}s ASL`,
        detail: `~${cutsPerMin} cuts/min (Balanced cadence)`
      },
      {
        icon: Gauge,
        label: 'Pacing Intensity',
        value: `${score}/100 Rating`,
        detail: analysis.metrics.pacing_classification || 'Dynamic & Moderated'
      },
      {
        icon: Layers,
        label: 'Visual Density',
        value: analysis.metrics.visual_density,
        detail: `~${bRoll}% Demonstrative inserts`
      },
      {
        icon: CheckCircle2,
        label: 'Retention Tactic',
        value: 'Step-by-Step Build',
        detail: 'Synchronized visual and auditory cues'
      }
    ]
  };
};

export const PacingStyleSummaryCard: React.FC<PacingStyleSummaryCardProps> = ({ analysis }) => {
  const config = getPacingStyleConfig(analysis);
  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl p-5 border shadow-xl transition-all duration-300 ${config.theme.cardBg} ${config.theme.border}`}
      id="primary-pacing-style-summary-card"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-xl ${config.theme.badgeBg} ${config.theme.accentText} border ${config.theme.badgeBorder} shrink-0 mt-0.5 shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Primary Pacing Style
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.theme.badgeBg} ${config.theme.badgeText} ${config.theme.badgeBorder}`}>
                {config.category}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-100 mt-1">
              {config.title}
            </h3>
            
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {config.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Trait Pills Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {config.traits.map((trait, index) => {
          const TraitIcon = trait.icon;
          return (
            <div
              key={index}
              className={`p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-1.5 hover:border-slate-700 transition`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center">
                  <TraitIcon className={`w-3 h-3 mr-1.5 ${config.theme.accentText}`} />
                  {trait.label}
                </span>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-100 truncate">
                  {trait.value}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {trait.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PacingStyleSummaryCard;
