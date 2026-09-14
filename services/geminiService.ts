import { VideoData, VideoEditorialProfile, YouTubeMetadata } from '../types';
import { getStoredGeminiKey } from '../utils/apiKeyStorage';

export const fetchYouTubeInfo = async (url: string): Promise<YouTubeMetadata> => {
  const res = await fetch(`/api/youtube-info?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to retrieve YouTube video details.');
  }
  return res.json();
};

export const analyzeVideoContent = async (
  videoData: VideoData,
  metadata?: YouTubeMetadata
): Promise<VideoEditorialProfile> => {
  const userApiKey = getStoredGeminiKey();
  if (!userApiKey) {
    const error = new Error('A Gemini API Key is required to run editorial analyses. Please click "Add Gemini Key" at the top of the page to connect your key.');
    (error as any).requiresKey = true;
    throw error;
  }

  const payload = {
    youtubeUrl: videoData.youtubeUrl,
    videoId: metadata?.videoId,
    title: videoData.title || metadata?.title,
    authorName: metadata?.authorName,
    transcript: videoData.transcript,
    userNotes: videoData.userNotes,
    analysisScope: videoData.analysisScope || 'hook',
    timeRange: videoData.timeRange
  };

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': userApiKey
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.error || 'Failed to generate video editorial analysis.');
    if (res.status === 401 || errorData.requiresKey) {
      (error as any).requiresKey = true;
    }
    throw error;
  }

  return res.json();
};

