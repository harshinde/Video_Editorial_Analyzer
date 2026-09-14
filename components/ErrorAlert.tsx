import React from 'react';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
}

const formatErrorMessage = (raw: string): { title: string; detail: string; isHighDemand: boolean } => {
  if (!raw) return { title: "Analysis Error", detail: "An unexpected error occurred.", isHighDemand: false };

  // Check for high demand / 503
  if (raw.includes("503") || raw.includes("high demand") || raw.includes("UNAVAILABLE")) {
    return {
      title: "Model High Demand (Temporary)",
      detail: "Google's Gemini models are currently experiencing a brief spike in traffic. Our system automatically attempts fallback models, but please click Retry below to re-submit your analysis.",
      isHighDemand: true
    };
  }

  // Check if raw error contains JSON
  const jsonMatch = raw.match(/\{.*"message"\s*:\s*"([^"]+)".*\}/);
  if (jsonMatch && jsonMatch[1]) {
    return {
      title: "Analysis Service Notice",
      detail: jsonMatch[1],
      isHighDemand: false
    };
  }

  return {
    title: "Analysis Error",
    detail: raw.replace(/^Error:\s*/i, ''),
    isHighDemand: false
  };
};

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose, onRetry }) => {
  const { title, detail, isHighDemand } = formatErrorMessage(message);

  return (
    <div
      className="w-full my-6 bg-red-950/60 border border-red-800/80 text-red-200 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn"
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-red-100">{title}</h4>
          <p className="text-xs text-red-300 mt-0.5 leading-relaxed max-w-2xl">{detail}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-100 text-xs font-medium rounded-lg border border-red-700/60 transition flex items-center shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Retry Now
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-900/50 transition"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
