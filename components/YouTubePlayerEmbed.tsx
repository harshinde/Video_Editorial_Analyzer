import React, { useRef, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface YouTubePlayerEmbedProps {
  videoId: string;
  seekTime: number | null;
  title?: string;
  authorName?: string;
}

const YouTubePlayerEmbed: React.FC<YouTubePlayerEmbedProps> = ({
  videoId,
  seekTime,
  title,
  authorName
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (seekTime !== null && iframeRef.current) {
      // Send postMessage to YouTube IFrame API to seek
      try {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [seekTime, true]
          }),
          '*'
        );
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'playVideo',
            args: []
          }),
          '*'
        );
      } catch (err) {
        console.warn('Could not postMessage to YouTube player', err);
      }
    }
  }, [seekTime]);

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.origin : ''
  )}&rel=0&modestbranding=1`;

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2 truncate">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-semibold border border-red-500/30">
            <Play className="w-3 h-3 mr-1 fill-current" /> Live Player
          </span>
          <span className="font-medium text-slate-200 truncate">{title || 'YouTube Video'}</span>
          {authorName && <span className="text-slate-400 truncate">• {authorName}</span>}
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center text-sky-400 hover:text-sky-300 hover:underline shrink-0 ml-2"
        >
          <span>Watch on YouTube</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>
      </div>

      <div className="relative aspect-video w-full bg-black">
        <iframe
          ref={iframeRef}
          id="yt-embed-player"
          src={embedUrl}
          title={title || 'YouTube video player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default YouTubePlayerEmbed;
