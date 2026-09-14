import { VideoData, VideoEditorialProfile, YouTubeMetadata } from '../types';

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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate video editorial analysis.');
  }

  return res.json();
};
