export interface YouTubeMetadata {
  videoId: string;
  url: string;
  title: string;
  authorName: string;
  authorUrl?: string;
  thumbnailUrl: string;
  durationFormatted?: string;
  hasTranscript?: boolean;
  transcriptSample?: string;
}

export interface StructuralBeat {
  timestamp: string; // e.g., "00:00 - 00:15"
  startSeconds: number; // For interactive seeking in YouTube player
  endSeconds?: number;
  beat_type: 'Hook' | 'Intro' | 'Core Content' | 'Story Arc' | 'Montage' | 'Climax' | 'CTA/Outro' | 'Transition';
  title: string;
  visual_focus: string; // e.g., "A-Roll host + Rapid B-Roll montage"
  audio_cue: string; // e.g., "Rising riser into beat drop"
  editorial_technique: string; // e.g., "Sub-2s cuts, zoom punch-ins, kinetic text teaser"
  estimated_avg_shot_duration?: number; // in seconds, e.g. 1.8, 3.4
  estimated_cut_count?: number; // estimated cuts in this beat/interval
  cuts_per_minute?: number; // e.g. 35
}

export interface ColorSwatch {
  name: string;
  hex: string;
  description: string;
}

export type AnalysisScope = 'hook' | 'custom' | 'macro';

export interface TimeRange {
  start: string; // "MM:SS"
  end: string;   // "MM:SS"
  startSeconds?: number;
  endSeconds?: number;
}

export interface MacroPacingPoint {
  time_window: string; // e.g. "0:00 - 1:30"
  startSeconds: number;
  phase_label: string; // e.g. "Hook & Retention Bait", "Deep Dive Exposition", "Climax"
  energy_rating: number; // 0 to 100
  shot_rhythm: string; // e.g. "1.8s cuts / Rapid zooms"
  key_editorial_shift: string; // e.g. "Music drops out, close-up camera punch"
}

export interface VideoEditorialProfile {
  narrativeSummary: string;
  editorialArchetype: string; // e.g., "Hyper-Paced Retention Vlog", "Cinematic Visual Essay"
  
  scope_analyzed?: {
    mode: AnalysisScope;
    label: string; // e.g. "Hook & Retention Pass (First 90s)"
    timeRangeFormatted?: string;
    sampling_summary?: string;
  };

  metrics: {
    average_shot_length_seconds: number; // e.g. 2.4
    pacing_score: number; // 0 to 100
    pacing_classification: string; // e.g. "Hyper-Paced (Shorts / Retention)", "Dynamic Moderated", "Contemplative"
    b_roll_ratio_percent: number; // estimated 0-100%
    visual_density: 'Minimalist' | 'Balanced' | 'High-Density Sensory';
  };

  cutting_style: {
    primary_transitions: string[]; // e.g., ["Hard Cuts", "Match Cuts", "Speed Ramps"]
    shot_rhythm_description: string;
    punch_in_zooms_usage: string; // e.g. "Frequent 10-15% scale pops on punchlines"
    framing_and_camera_movement: string; // e.g. "Host centered at eye-level, smooth motorized pans for B-roll"
  };

  visual_identity: {
    color_grade_palette: ColorSwatch[];
    lighting_style: string;
    motion_graphics_and_text: string; // e.g. "Bold sans-serif kinetic subtitles, animated arrows, paper textures"
    b_roll_characteristics: string;
  };

  audio_landscape: {
    music_tempo_and_genre: string; // e.g. "128 BPM Synthwave / Instrumental Lo-Fi"
    sound_design_elements: string[]; // e.g. ["Whooshes on transitions", "Bass hits on key takeaways"]
    vocal_delivery_and_ducking: string;
    inferred_moods: string[];
  };

  structural_timeline: StructuralBeat[];

  macro_pacing_curve?: MacroPacingPoint[];

  creator_replication_guide: {
    essential_rules: string[]; // Key editing rules to replicate this style
    recommended_tools_or_fx: string[]; // Recommended LUTs, sound effects, plugins
    common_pitfalls_to_avoid: string[];
  };
}

export interface VideoData {
  youtubeUrl: string;
  title?: string;
  description?: string;
  transcript?: string;
  userNotes?: string;
  analysisScope?: AnalysisScope;
  timeRange?: TimeRange;
}
