import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  Sparkles,
  Trash2,
  Loader2
} from 'lucide-react';
import { useGeminiKey } from '../utils/apiKeyStorage';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
  noticeMessage?: string | null;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  noticeMessage
}) => {
  const { apiKey, hasKey, maskedKey, saveKey, removeKey } = useGeminiKey();
  const [inputKey, setInputKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey || '');
      setFeedback(null);
      setShowKey(false);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();

    if (!trimmed) {
      setFeedback({
        type: 'error',
        message: 'Please paste your Gemini API key before saving.'
      });
      return;
    }

    // Basic format check
    if (!trimmed.startsWith('AIza') && trimmed.length < 20) {
      setFeedback({
        type: 'error',
        message: 'Invalid key format. Gemini API keys usually start with "AIza..."'
      });
      return;
    }

    setIsVerifying(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/verify-gemini-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: trimmed })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Failed to verify key with Google Gemini.');
      }

      // Save to localStorage
      saveKey(trimmed);
      setFeedback({
        type: 'success',
        message: 'API Key verified and saved successfully! All analysis credits will be billed to your account.'
      });

      if (onKeySaved) {
        onKeySaved();
      }

      // Auto close after 1.2s on success
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Key verification failed. Please check your key in Google AI Studio.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemove = () => {
    removeKey();
    setInputKey('');
    setFeedback({
      type: 'success',
      message: 'Gemini API key has been removed from this browser.'
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      id="gemini-key-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden"
        id="gemini-key-modal"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3.5 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center">
              Add Your Gemini API Key
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                BYOK Required
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect your own Google AI Studio key so that API usage is billed directly to your account.
            </p>
          </div>
        </div>

        {/* Notice Message if triggered by action */}
        {noticeMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/50 border border-amber-800/80 text-xs text-amber-200 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Gemini Key Required</p>
              <p className="mt-0.5 text-amber-300/90">{noticeMessage}</p>
            </div>
          </div>
        )}

        {/* Instructions Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-5 space-y-2.5 text-xs text-slate-300">
          <div className="font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
              How to obtain a free Gemini API Key:
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 inline-flex items-center font-bold underline decoration-sky-500/40"
            >
              Google AI Studio <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
            <li>
              Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Google AI Studio API Keys</a> and sign in with your Google account.
            </li>
            <li>
              Click <strong className="text-slate-200">"Create API Key"</strong> in an existing or new project.
            </li>
            <li>
              Copy the generated key (starts with <code className="px-1 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">AIza...</code>) and paste it below.
            </li>
          </ol>

          <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Your key is saved only in your local browser storage. It is never persisted on any central server or database.
            </span>
          </div>
        </div>

        {/* Key Form */}
        <form onSubmit={handleVerifyAndSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="gemini-api-key-input" className="text-xs font-semibold text-slate-300">
                Gemini API Key
              </label>
              {hasKey && (
                <span className="text-[11px] text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Active: {maskedKey}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="gemini-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Paste AIzaSy... key here"
                disabled={isVerifying}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/70 border border-rose-800 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-snug">{feedback.message}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {hasKey ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isVerifying}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 transition flex items-center"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Remove Key
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">
                Key required to run analysis
              </span>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || !inputKey.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center shadow-lg shadow-sky-950/50 border border-sky-500/50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Testing Key...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Save & Connect Key
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeminiApiKeyModal;
