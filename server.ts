import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { VideoEditorialProfile, YouTubeMetadata } from "./types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to extract YouTube Video ID
function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  // If already an 11-character alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Check URL patterns
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1).split(/[?#]/)[0];
      if (id && id.length === 11) return id;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1]?.split(/[?#]/)[0];
        if (id && id.length === 11) return id;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1]?.split(/[?#]/)[0];
        if (id && id.length === 11) return id;
      }
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;
    }
  } catch {
    // Regex fallback
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
  }

  return null;
}

// Fetch YouTube caption/transcript tracks if accessible
async function fetchYouTubeCaptions(videoId: string): Promise<string | null> {
  try {
    const videoPageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (!videoPageRes.ok) return null;
    const html = await videoPageRes.text();

    const playerCaptionsMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
    if (!playerCaptionsMatch || !playerCaptionsMatch[1]) return null;

    const captionTracks = JSON.parse(playerCaptionsMatch[1]);
    if (!Array.isArray(captionTracks) || captionTracks.length === 0) return null;

    // Prefer English or first track
    const selectedTrack = captionTracks.find((t: any) => t.languageCode === "en" || t.vssId?.includes(".en")) || captionTracks[0];
    if (!selectedTrack?.baseUrl) return null;

    const transcriptRes = await fetch(selectedTrack.baseUrl);
    if (!transcriptRes.ok) return null;
    const xml = await transcriptRes.text();

    // Parse simple XML <text start="X" dur="Y">text</text>
    const textMatches = Array.from(xml.matchAll(/<text start="([^"]+)" dur="([^"]+)">([^<]+)<\/text>/g));
    if (textMatches.length === 0) return null;

    const transcriptLines = textMatches.slice(0, 150).map(m => {
      const startSec = Math.floor(parseFloat(m[1]));
      const min = Math.floor(startSec / 60);
      const sec = startSec % 60;
      const timestamp = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
      const decodedText = m[3]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `[${timestamp}] ${decodedText}`;
    });

    return transcriptLines.join("\n");
  } catch (err) {
    console.warn("Could not retrieve subtitles directly:", err);
    return null;
  }
}

// API: Get Video Information from URL
app.get("/api/youtube-info", async (req, res) => {
  const urlParam = req.query.url as string;
  if (!urlParam) {
    return res.status(400).json({ error: "Missing 'url' query parameter." });
  }

  const videoId = extractYouTubeId(urlParam);
  if (!videoId) {
    return res.status(400).json({ error: "Invalid YouTube URL or Video ID." });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedRes = await fetch(oembedUrl);
    let title = "YouTube Video";
    let authorName = "Creator";
    let authorUrl = "";
    let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    if (oembedRes.ok) {
      const data = await oembedRes.json();
      title = data.title || title;
      authorName = data.author_name || authorName;
      authorUrl = data.author_url || "";
      if (data.thumbnail_url) {
        thumbnailUrl = data.thumbnail_url;
      }
    }

    // Try fetching subtitles in the background
    const transcript = await fetchYouTubeCaptions(videoId);

    const metadata: YouTubeMetadata = {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title,
      authorName,
      authorUrl,
      thumbnailUrl,
      hasTranscript: Boolean(transcript),
      transcriptSample: transcript ? transcript.slice(0, 1500) : undefined
    };

    return res.json(metadata);
  } catch (error: any) {
    console.error("Error fetching video metadata:", error);
    return res.status(500).json({ error: "Failed to fetch video information." });
  }
});

// Define Gemini Structured Schema for Editorial Analysis
const editorialProfileSchema = {
  type: Type.OBJECT,
  properties: {
    narrativeSummary: {
      type: Type.STRING,
      description: "A comprehensive 2-3 paragraph critique of the video's editorial identity, storytelling mechanics, audience retention strategy, and aesthetic tone."
    },
    editorialArchetype: {
      type: Type.STRING,
      description: "Concise name for the editorial style (e.g., 'Hyper-Paced Retention Vlog', 'Cinematic Visual Essay', 'Minimalist Documentary', 'High-Energy Tech Review', 'Dynamic Narrative Shorts')"
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        average_shot_length_seconds: { type: Type.NUMBER, description: "Estimated average length per shot in seconds (e.g., 1.8 for fast shorts, 4.5 for essays)" },
        pacing_score: { type: Type.NUMBER, description: "Pacing intensity score from 0 (very contemplative/ambient) to 100 (relentless fast-paced cuts)" },
        pacing_classification: { type: Type.STRING, description: "e.g. 'Hyper-Paced (Shorts / Retention)', 'Dynamic & Moderated', 'Methodical & Atmospheric'" },
        b_roll_ratio_percent: { type: Type.NUMBER, description: "Estimated percentage of screen time dedicated to B-roll, overlays, or screencasts vs. main talking head (0 to 100)" },
        visual_density: { type: Type.STRING, description: "'Minimalist' or 'Balanced' or 'High-Density Sensory'" }
      },
      required: ["average_shot_length_seconds", "pacing_score", "pacing_classification", "b_roll_ratio_percent", "visual_density"]
    },
    cutting_style: {
      type: Type.OBJECT,
      properties: {
        primary_transitions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Dominant transition styles used (e.g., 'Jump Cuts', 'Match Cuts', 'Speed Ramps', 'Whip Pans', 'J/L Cuts', 'Digital Glitches', 'Hard Straight Cuts')"
        },
        shot_rhythm_description: { type: Type.STRING, description: "Detailed description of cut pacing, cadence changes during comedic vs dramatic moments, and breath pauses." },
        punch_in_zooms_usage: { type: Type.STRING, description: "How camera punch-ins, crop zooms, and digital reframing are leveraged for emphasis or pacing." },
        framing_and_camera_movement: { type: Type.STRING, description: "Framing composition, focal length feel, camera motion (handheld, gimbal, static tripod, robotic dolly)." }
      },
      required: ["primary_transitions", "shot_rhythm_description", "punch_in_zooms_usage", "framing_and_camera_movement"]
    },
    visual_identity: {
      type: Type.OBJECT,
      properties: {
        color_grade_palette: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hex: { type: Type.STRING, description: "6-character hex color code starting with # (e.g. '#0F172A')" },
              description: { type: Type.STRING }
            },
            required: ["name", "hex", "description"]
          },
          description: "3 to 5 core color grading swatches representing the video's aesthetic mood (e.g., Teal shadows, Warm highlights, Deep blacks, Neon pop)."
        },
        lighting_style: { type: Type.STRING, description: "Lighting setup characteristics (e.g., Moody Rembrandt key light with RGB rim, diffuse softbox, natural practical sunlight)." },
        motion_graphics_and_text: { type: Type.STRING, description: "On-screen text design, kinetic subtitles, lower thirds, 3D tracking, paper cut-out stop-motion, or arrows/icons." },
        b_roll_characteristics: { type: Type.STRING, description: "Style and source of B-roll (cinematic macro 4K, archive footage, memes, screen captures, custom animation)." }
      },
      required: ["color_grade_palette", "lighting_style", "motion_graphics_and_text", "b_roll_characteristics"]
    },
    audio_landscape: {
      type: Type.OBJECT,
      properties: {
        music_tempo_and_genre: { type: Type.STRING, description: "Background music tempo (BPM), instrumentation, and genres across chapters." },
        sound_design_elements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Foley and sound design techniques (e.g., 'Sub-bass impact on chapter title', 'Film projector whir', 'Paper rustle', 'Whoosh pan transition', 'Audio cutoff for punchline')"
        },
        vocal_delivery_and_ducking: { type: Type.STRING, description: "Vocal energy, compression, EQ warmth, and side-chain music ducking behaviour." },
        inferred_moods: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key emotional moods evoked throughout the video."
        }
      },
      required: ["music_tempo_and_genre", "sound_design_elements", "vocal_delivery_and_ducking", "inferred_moods"]
    },
    structural_timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "Formatted timestamp range, e.g., '00:00 - 00:15'" },
          startSeconds: { type: Type.NUMBER, description: "Beginning timestamp in seconds as an integer, e.g., 0, 15, 62" },
          endSeconds: { type: Type.NUMBER, description: "Ending timestamp in seconds as an integer" },
          beat_type: { type: Type.STRING, description: "'Hook', 'Intro', 'Core Content', 'Story Arc', 'Montage', 'Climax', 'CTA/Outro', or 'Transition'" },
          title: { type: Type.STRING, description: "Short descriptive name for this beat/scene" },
          visual_focus: { type: Type.STRING, description: "Visual composition during this interval" },
          audio_cue: { type: Type.STRING, description: "Key audio or musical movement during this segment" },
          editorial_technique: { type: Type.STRING, description: "Specific editing trick or pacing principle demonstrated here" },
          estimated_avg_shot_duration: { type: Type.NUMBER, description: "Estimated average shot length in seconds for this specific scene (e.g., 1.5, 3.2, 6.0)" },
          estimated_cut_count: { type: Type.NUMBER, description: "Estimated number of cuts/edits in this scene segment" },
          cuts_per_minute: { type: Type.NUMBER, description: "Estimated pace in cuts per minute during this scene (e.g., 40 for hyper-fast hook, 12 for calm exposition)" }
        },
        required: ["timestamp", "startSeconds", "beat_type", "title", "visual_focus", "audio_cue", "editorial_technique"]
      },
      description: "A chronological breakdown of distinct editorial beats/scenes across the analyzed scope."
    },
    macro_pacing_curve: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time_window: { type: Type.STRING, description: "Time interval e.g. '0:00 - 1:30', '3:00 - 4:30'" },
          startSeconds: { type: Type.NUMBER, description: "Start time in seconds for video playback seeking" },
          phase_label: { type: Type.STRING, description: "Narrative phase e.g. 'Opening Retention Hook', 'Expository Build', 'Core Climax'" },
          energy_rating: { type: Type.NUMBER, description: "Pacing intensity / energy score from 0 to 100 for this segment" },
          shot_rhythm: { type: Type.STRING, description: "Estimated average shot length and cut frequency during this phase" },
          key_editorial_shift: { type: Type.STRING, description: "Main editorial transition or pacing technique introduced here" }
        },
        required: ["time_window", "startSeconds", "phase_label", "energy_rating", "shot_rhythm", "key_editorial_shift"]
      },
      description: "Periodic snapshot checkpoints demonstrating how pacing, shot frequency, and energy modulate across the video."
    },
    creator_replication_guide: {
      type: Type.OBJECT,
      properties: {
        essential_rules: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Top 4-6 practical, actionable editing rules a creator must follow to emulate this specific video's style."
        },
        recommended_tools_or_fx: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Specific editing tools, LUTs, transition packs, sound effects, or motion templates recommended."
        },
        common_pitfalls_to_avoid: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Mistakes to avoid that would ruin this style (e.g., 'Letting talking head shots run longer than 4 seconds without re-framing', 'Over-compressing voiceover')."
        }
      },
      required: ["essential_rules", "recommended_tools_or_fx", "common_pitfalls_to_avoid"]
    }
  },
  required: [
    "narrativeSummary",
    "editorialArchetype",
    "metrics",
    "cutting_style",
    "visual_identity",
    "audio_landscape",
    "structural_timeline",
    "creator_replication_guide"
  ]
};

// API: Analyze Video Editorial Style
app.post("/api/analyze", async (req, res) => {
  const { 
    youtubeUrl, 
    videoId: providedId, 
    title, 
    authorName, 
    transcript: providedTranscript, 
    userNotes,
    analysisScope = 'hook',
    timeRange
  } = req.body;

  if (!youtubeUrl && !providedId) {
    return res.status(400).json({ error: "A valid YouTube URL or Video ID is required." });
  }

  const videoId = providedId || extractYouTubeId(youtubeUrl);
  if (!videoId) {
    return res.status(400).json({ error: "Could not identify a valid YouTube video from the provided link." });
  }

  // Require user-provided Gemini API Key from header or body (never use host personal key)
  const userApiKey = (req.headers["x-gemini-key"] as string) || req.body?.geminiApiKey;
  if (!userApiKey || typeof userApiKey !== "string" || !userApiKey.trim()) {
    return res.status(401).json({
      error: "A Gemini API Key is required to run editorial analyses. Please click 'Add Gemini Key' in the top header to enter your API key so that credits are billed to your account.",
      requiresKey: true
    });
  }

  const apiKey = userApiKey.trim();

  try {
    // If transcript was not supplied, try fetching it
    let transcriptText = providedTranscript || "";
    if (!transcriptText) {
      const fetched = await fetchYouTubeCaptions(videoId);
      if (fetched) transcriptText = fetched;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const systemInstruction = `You are a world-class film editor, YouTube retention engineer, and creative director with deep expertise in YouTube storytelling, pacing, editing software (Premiere Pro, DaVinci Resolve, Final Cut Pro), sound design, and cinematography.
Your objective is to thoroughly analyze the editorial style of the specified YouTube video.
Infer concrete, highly accurate stylistic decisions:
- Cut rhythm, shot length, and pacing retention mechanics.
- B-roll vs. A-roll usage, graphic overlays, and text typography.
- Color grading palette (hex codes), lighting setup, and visual motifs.
- Sound design, background music tempos, and vocal ducking.
- Chronological timeline breakdown with realistic timestamp intervals so viewers can cross-reference with the video.
- Actionable blueprint for video creators seeking to emulate or dissect this exact editorial style.

Conform strictly to the JSON schema provided.`;

    let scopeInstruction = "";
    let scopeLabel = "Hook & Retention Pass (First 90s)";

    if (analysisScope === "custom" && timeRange?.start && timeRange?.end) {
      scopeLabel = `Target Window: ${timeRange.start} – ${timeRange.end}`;
      scopeInstruction = `
ANALYSIS SCOPE DIRECTIVE: TARGETED TIME WINDOW (${timeRange.start} to ${timeRange.end})
- The user has requested an in-depth editorial deconstruction specifically for the scene/window between ${timeRange.start} and ${timeRange.end}.
- Direct your focus, structural beats, and shot pacing evaluations strictly to this targeted sequence.
- Detail why this specific segment was edited this way (e.g. montage buildup, exposition transition, storytelling climax).`;
    } else if (analysisScope === "macro") {
      scopeLabel = "Full-Video Macro Pass (Periodic Sampling)";
      scopeInstruction = `
ANALYSIS SCOPE DIRECTIVE: FULL-VIDEO MACRO PASS WITH DISTRIBUTED SAMPLING
- The user has requested a macro-level editorial breakdown of the entire video length.
- Perform periodic sampling across the entire runtime (e.g., Hook/Intro, 25% mark, 50% midpoint, 75% climax build, and conclusion).
- YOU MUST POPULATE 'macro_pacing_curve' with 4 to 6 chronological snapshot checkpoints. For each checkpoint, evaluate the energy rating (0-100), cut frequency/shot speed, and editorial technique shift.
- In 'structural_timeline', represent the overarching narrative milestones across the full video runtime.`;
    } else {
      // Default: hook pass
      scopeLabel = "Hook & Retention Pass (First 90s)";
      scopeInstruction = `
ANALYSIS SCOPE DIRECTIVE: HOOK & RETENTION PASS (First 90 Seconds: 0:00 - 1:30)
- YouTube audiences make retention decisions within the first 30 to 90 seconds.
- Focus your deep analysis on the opening hook: the visual pattern interrupts, first B-roll transition, thesis statement delivery, sound design stingers, and title card timing.
- In 'structural_timeline', break down the opening 0:00 - 1:30 into fine-grained micro-beats (e.g., 0-5s Hook, 5-20s Teaser, 20-45s Exposition Setup, etc.).`;
    }

    const prompt = `Analyze the editorial style and video editing attributes of this YouTube video:

Video ID: ${videoId}
Target YouTube URL: https://www.youtube.com/watch?v=${videoId}
Video Title: ${title || "Unknown"}
Channel / Creator: ${authorName || "Unknown"}
${scopeInstruction}
${userNotes ? `Creator Context / User Notes: ${userNotes}` : ""}
${transcriptText ? `Transcript & Dialogue Cues:\n${transcriptText.slice(0, 7000)}` : "Direct subtitles were not extracted. Use your knowledge of this creator, title, format, and YouTube editing conventions to deduce the precise editorial styles."}

Generate the full editorial profile matching the schema.`;

    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash"];
    let lastError: any = null;
    let rawText: string | null = null;

    for (const modelName of candidateModels) {
      // Try with retry for transient 503 / 429
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`Calling Gemini with model ${modelName} (attempt ${attempt + 1})...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: editorialProfileSchema,
              temperature: 0.4
            }
          });

          if (response && response.text) {
            rawText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errorMsg = String(err?.message || "");
          const isDemandError = errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("429");
          console.warn(`Attempt ${attempt + 1} with ${modelName} failed: ${errorMsg}`);
          
          if (isDemandError && attempt === 0) {
            // Wait 1.5s before retrying or switching model
            await new Promise((r) => setTimeout(r, 1500));
          } else {
            // Move to next candidate model
            break;
          }
        }
      }

      if (rawText) {
        break;
      }
    }

    if (!rawText) {
      const errMsg = lastError?.message || "";
      if (errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE")) {
        return res.status(503).json({
          error: "Gemini is currently experiencing high demand. Automatic retry initiated, please try again in a few seconds."
        });
      }
      throw lastError || new Error("Failed to receive analysis response from Gemini.");
    }

    // Clean any possible markdown code fencing
    const cleanedText = rawText.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    const parsedData: VideoEditorialProfile = JSON.parse(cleanedText);
    
    parsedData.scope_analyzed = {
      mode: analysisScope,
      label: scopeLabel,
      timeRangeFormatted: analysisScope === 'custom' && timeRange ? `${timeRange.start} – ${timeRange.end}` : undefined,
      sampling_summary: analysisScope === 'macro' 
        ? "Periodic distributed checkpoints sampled across full video runtime" 
        : analysisScope === 'custom'
        ? `Targeted micro-analysis on ${timeRange?.start || '00:00'} to ${timeRange?.end || '01:30'}`
        : "High-retention first 90 seconds deep dive"
    };

    return res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini Analysis Error:", err);
    const msg = String(err?.message || "");
    if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid") || msg.includes("403") || msg.includes("401")) {
      return res.status(401).json({
        error: "The provided Gemini API Key is invalid, expired, or has insufficient permissions. Please click 'Add Gemini Key' in the header to update it.",
        requiresKey: true
      });
    }
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
      return res.status(429).json({
        error: "Your Gemini API Key quota has been exceeded. Please check your usage limits on Google AI Studio."
      });
    }
    return res.status(500).json({
      error: err?.message || "Failed to analyze video editorial style."
    });
  }
});

// Endpoint to verify a user-provided Gemini API key
app.post("/api/verify-gemini-key", async (req, res) => {
  const userApiKey = (req.headers["x-gemini-key"] as string) || req.body?.apiKey;
  if (!userApiKey || typeof userApiKey !== "string" || !userApiKey.trim()) {
    return res.status(400).json({
      valid: false,
      error: "No Gemini API key was provided. Please paste your key from Google AI Studio."
    });
  }

  const apiKey = userApiKey.trim();
  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    // Run a minimal token call to test key validity & quota
    const testResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "ping",
      config: {
        maxOutputTokens: 2,
        temperature: 0.1
      }
    });

    if (testResponse) {
      return res.json({
        valid: true,
        message: "Gemini API key is verified and operational!"
      });
    }

    return res.status(400).json({
      valid: false,
      error: "Did not receive a response from Gemini. Please check the key."
    });
  } catch (err: any) {
    const message = err?.message || String(err);
    console.error("Gemini key test failed:", message);
    if (message.includes("API_KEY_INVALID") || message.includes("400") || message.includes("403") || message.includes("API key not valid")) {
      return res.status(400).json({
        valid: false,
        error: "The provided Gemini API Key is invalid or expired. Please check your Google AI Studio dashboard."
      });
    }
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
      return res.status(400).json({
        valid: false,
        error: "This Gemini API Key has exceeded its rate limit or quota in Google AI Studio."
      });
    }
    return res.status(400).json({
      valid: false,
      error: `Verification failed: ${message}`
    });
  }
});

// Setup Vite development middleware or static production serve
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Editorial Analyzer server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
