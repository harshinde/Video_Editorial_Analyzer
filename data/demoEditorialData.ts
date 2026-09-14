import { VideoEditorialProfile, YouTubeMetadata } from '../types';

export const DEMO_VIDEO_METADATA: YouTubeMetadata = {
  videoId: 'TcMBFSGVi1c',
  url: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
  title: "Marvel Studios' Avengers: Endgame - Official Trailer",
  authorName: 'Marvel Entertainment',
  authorUrl: 'https://www.youtube.com/@marvel',
  thumbnailUrl: 'https://i.ytimg.com/vi/TcMBFSGVi1c/hqdefault.jpg',
  durationFormatted: '02:26',
  hasTranscript: true
};

export const DEMO_EDITORIAL_ANALYSIS: VideoEditorialProfile = {
  narrativeSummary:
    "An iconic masterclass in cinematic crescendo editing. The trailer opens with a lingering, melancholic slow-burn (Tony Stark isolated in the void of deep space) establishing profound emotional vulnerability before systematically escalating in cut velocity, orchestral tension, and visual scale into a thunderous climax montage.",
  editorialArchetype: "High-Concept Cinematic Crescendo & Escalation",
  
  scope_analyzed: {
    mode: 'macro',
    label: 'Complete Trailer Edit (0:00 - 2:26)',
    timeRangeFormatted: '0:00 - 2:26',
    sampling_summary: 'Full timeline beat analysis across 26 major editorial cut intervals.'
  },

  metrics: {
    average_shot_length_seconds: 2.2,
    pacing_score: 88,
    pacing_classification: 'Dramatic Accelerating Crescendo',
    b_roll_ratio_percent: 74,
    visual_density: 'High-Density Sensory'
  },

  cutting_style: {
    primary_transitions: [
      'Hard Cuts on Downbeats',
      'Flash Frame Whites',
      'Subliminal Match Cuts',
      'Dip to Black Dramatic Pauses'
    ],
    shot_rhythm_description:
      'Starts with deliberate 4.5–6.0 second contemplative shots, gradually compressing shot length down to 0.8–1.2 second percussive impact cuts during the climactic third act.',
    punch_in_zooms_usage:
      'Slow, imperceptible creeping camera zooms (100% to 106%) on character close-ups to elevate psychological claustrophobia and emotional resonance.',
    framing_and_camera_movement:
      'Cinematic 2.39:1 anamorphic framing with centered character eyes; transitions from stationary floating tripod shots into kinetic, handheld lateral dolly tracking during battle memories.'
  },

  visual_identity: {
    color_grade_palette: [
      {
        name: 'Quantum Slate Black',
        hex: '#0d1117',
        description: 'Deep crushed shadows and desaturated negative space representing loss and vacuum.'
      },
      {
        name: 'Muted Crimson Scarlet',
        hex: '#8e1616',
        description: 'Selective selective red accents in flashback memories and Marvel studio ident card.'
      },
      {
        name: 'Deep Nebula Indigo',
        hex: '#1e293b',
        description: 'Cool blue-green ambient fill grading the Benatar spaceship cabin.'
      },
      {
        name: 'Desaturated Ash White',
        hex: '#e2e8f0',
        description: 'Blown-out overcast daylight across Avengers compound exteriors.'
      },
      {
        name: 'Burnished Gold Rim',
        hex: '#d97706',
        description: 'Subtle warm tungsten rim lighting on character silhouettes.'
      }
    ],
    lighting_style:
      'Chiaroscuro low-key cinematic lighting. High contrast ratios with deep shadow roll-off and intense edge rim highlights.',
    motion_graphics_and_text:
      'Disintegrating ash-particle typography for the Marvel logo; minimalist centered metallic title typography keyed to audio impacts.',
    b_roll_characteristics:
      'Monochrome archival flashbacks with selective desaturation, cinematic drone establishing plates, and macro character portraits.'
  },

  audio_landscape: {
    music_tempo_and_genre:
      'Orchestral Hybrid Epic: Begins as solitary minor-key piano notes (~58 BPM), transitioning into building staccato string ostinatos, culminating in thunderous 130 BPM brass swells.',
    sound_design_elements: [
      'Isolated vocal dryness in the opening helmet recording',
      'Heavy sub-bass braams and cinematic risers preceding cut shifts',
      'Complete audio silence/dropouts preceding memorable one-liners ("Whatever it takes")',
      'Mechanical breathing foley and helmet audio distortion filters'
    ],
    vocal_delivery_and_ducking:
      'Heavy sidechain ducking (-14dB) on orchestral strings whenever dialogue occurs, ensuring intimate vocal clarity even at peak score volume.',
    inferred_moods: [
      'Grief & Vulnerability',
      'Desperate Defiance',
      'Resolute Momentum',
      'Monumental Anticipation'
    ]
  },

  structural_timeline: [
    {
      timestamp: '00:00 - 00:28',
      startSeconds: 0,
      endSeconds: 28,
      beat_type: 'Hook',
      title: 'The Solitary Confession (Tony Stark)',
      visual_focus: 'Tight anamorphic close-up of iron helmet + floating adrift in deep space',
      audio_cue: 'Dry whispered dialogue with zero musical score, faint life-support beeps',
      editorial_technique: 'Ultra-long 6.2s shot duration. Withholds cuts to force viewer intimacy and dread.',
      estimated_avg_shot_duration: 5.6,
      estimated_cut_count: 5,
      cuts_per_minute: 11
    },
    {
      timestamp: '00:28 - 00:54',
      startSeconds: 28,
      endSeconds: 54,
      beat_type: 'Intro',
      title: 'World in Mourning & The Farm',
      visual_focus: 'Empty Avengers compound, Clint Barton teaching archery in golden hour sunlight',
      audio_cue: 'Soft melancholy piano motif enters; distant thunder roll',
      editorial_technique: 'Gentle cross-fades and smooth horizontal pans contrasting past peace with present desolation.',
      estimated_avg_shot_duration: 3.7,
      estimated_cut_count: 7,
      cuts_per_minute: 16
    },
    {
      timestamp: '00:54 - 01:25',
      startSeconds: 54,
      endSeconds: 85,
      beat_type: 'Story Arc',
      title: 'Monochrome Echoes & The Vow',
      visual_focus: 'Selective-color desaturated flashbacks to fallen heroes (Peggy, Odin, Falcon)',
      audio_cue: 'Rising string ostinato starts accelerating; brass swells emerge beneath dialogue',
      editorial_technique: 'Match cuts connecting past memories to present solemn faces; rhythmic cutting on vocal cadence.',
      estimated_avg_shot_duration: 2.8,
      estimated_cut_count: 11,
      cuts_per_minute: 21
    },
    {
      timestamp: '01:25 - 01:58',
      startSeconds: 85,
      endSeconds: 118,
      beat_type: 'Montage',
      title: 'Whatever It Takes (The Assembly)',
      visual_focus: 'Armoring up, loading quantum suits, synchronized stride down the hangar bay',
      audio_cue: 'The iconic Avengers fanfare motif played in a mournful, heroic cadence',
      editorial_technique: 'Rapid sub-2.0s montage cuts timed to low-frequency orchestral percussions.',
      estimated_avg_shot_duration: 1.8,
      estimated_cut_count: 18,
      cuts_per_minute: 33
    },
    {
      timestamp: '01:58 - 02:18',
      startSeconds: 118,
      endSeconds: 138,
      beat_type: 'Climax',
      title: 'Title Disintegration & Battle Crescendo',
      visual_focus: 'Avengers logo reforming from shattered glass and particle dust',
      audio_cue: 'Huge bass drop braam followed by sudden total silence',
      editorial_technique: 'Stroboscopic flash cuts, high-frequency kinetic sound design.',
      estimated_avg_shot_duration: 1.2,
      estimated_cut_count: 17,
      cuts_per_minute: 50
    },
    {
      timestamp: '02:18 - 02:26',
      startSeconds: 138,
      endSeconds: 146,
      beat_type: 'CTA/Outro',
      title: 'Humor Tag & Release Date',
      visual_focus: 'Thor and Captain Marvel stare-down with Stormbreaker weapon summon',
      audio_cue: 'Metallic weapon whoosh, punchy one-liner: "I like this one"',
      editorial_technique: 'Medium two-shot held steadily to let comedic beat land naturally.',
      estimated_avg_shot_duration: 4.0,
      estimated_cut_count: 2,
      cuts_per_minute: 15
    }
  ],

  macro_pacing_curve: [
    {
      time_window: '0:00 - 0:30',
      startSeconds: 0,
      phase_label: 'Contemplative Intro',
      energy_rating: 18,
      shot_rhythm: '5.6s average shot duration / Static holds',
      key_editorial_shift: 'No background score. Isolated whispered dialogue creates intense psychological gravity.'
    },
    {
      time_window: '0:30 - 0:55',
      startSeconds: 30,
      phase_label: 'Rising Exposition',
      energy_rating: 38,
      shot_rhythm: '3.7s average shot duration / Slow drift',
      key_editorial_shift: 'Soft piano theme enters. Cross-cutting between surviving members.'
    },
    {
      time_window: '0:55 - 1:25',
      startSeconds: 55,
      phase_label: 'Emotional Escalation',
      energy_rating: 62,
      shot_rhythm: '2.8s average shot duration / Match cuts',
      key_editorial_shift: 'Monochrome flashbacks with selective red accents. Staccato string ostinato begins.'
    },
    {
      time_window: '1:25 - 1:58',
      startSeconds: 85,
      phase_label: 'Percussive Assembly',
      energy_rating: 86,
      shot_rhythm: '1.8s cuts / Rapid zooms & B-roll',
      key_editorial_shift: 'Repeated vocal motif ("Whatever it takes") cut across 4 distinct characters.'
    },
    {
      time_window: '1:58 - 2:18',
      startSeconds: 118,
      phase_label: 'Climactic Peak',
      energy_rating: 98,
      shot_rhythm: '1.2s rapid impact montage',
      key_editorial_shift: 'Epic Avengers theme climax with stroboscopic logo reveal and sub-bass drop.'
    },
    {
      time_window: '2:18 - 2:26',
      startSeconds: 138,
      phase_label: 'Comedic Tag',
      energy_rating: 45,
      shot_rhythm: '4.0s steady medium two-shot',
      key_editorial_shift: 'Score cuts out completely; natural room tone for character chemistry.'
    }
  ],

  creator_replication_guide: {
    essential_rules: [
      'The 3:1 Velocity Shift: Start your narrative at 3x your intended climax shot duration to create noticeable pacing contrast.',
      'Sound Cut Primacy: Drop all music 1 to 2 beats before a major thematic line to multiply its perceived emotional weight by 10x.',
      'Selective Color Grading in Flashbacks: Grade archival clips to high-contrast monochrome with 1 single isolated hue (e.g. crimson) to anchor memory association.',
      'Dialogue Cadence Cutting: Never cut video simultaneously with vocal pauses. Cut 3-6 frames into the next character reaction while the preceding voiceover is still ringing out (J-Cut / L-Cut).'
    ],
    recommended_tools_or_fx: [
      'DaVinci Resolve Magic Mask for selective memory color isolating',
      'Cinematic Hybrid Braam & Shepard Tone riser sound library (96kHz 24-bit)',
      'Subtle Film Grain (Kodak 5219 500T 35mm profile) to bind digital VFX with live footage',
      'Optical Flow slow-motion for dramatic 40% speed ramps on action beats'
    ],
    common_pitfalls_to_avoid: [
      'Starting with fast cuts too early, eliminating anywhere for the edit intensity to escalate.',
      'Allowing music score to compete in mid frequencies (500Hz - 3kHz) with dialogue rather than carving an EQ pocket.',
      'Using arbitrary transitions (wipes/slides) instead of letting character movement or lighting changes motivate hard cuts.'
    ]
  }
};
