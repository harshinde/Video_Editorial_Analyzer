import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yt_editorial_gemini_api_key';
const EVENT_NAME = 'gemini-key-updated';

export const getStoredGeminiKey = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const setStoredGeminiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  try {
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: trimmed }));
  } catch (err) {
    console.error('Failed to save Gemini key to localStorage:', err);
  }
};

export const removeStoredGeminiKey = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: '' }));
  } catch (err) {
    console.error('Failed to remove Gemini key from localStorage:', err);
  }
};

export const maskApiKey = (key: string): string => {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 10) return '••••••••';
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
};

/**
 * Hook to reactively track and manage the Gemini API key in state
 */
export const useGeminiKey = () => {
  const [apiKey, setApiKey] = useState<string>(() => getStoredGeminiKey());

  useEffect(() => {
    const handleKeyChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setApiKey(customEvent.detail ?? getStoredGeminiKey());
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setApiKey(e.newValue || '');
      }
    };

    window.addEventListener(EVENT_NAME, handleKeyChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleKeyChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const saveKey = useCallback((newKey: string) => {
    setStoredGeminiKey(newKey);
    setApiKey(newKey.trim());
  }, []);

  const removeKey = useCallback(() => {
    removeStoredGeminiKey();
    setApiKey('');
  }, []);

  return {
    apiKey,
    hasKey: Boolean(apiKey && apiKey.trim().length > 0),
    maskedKey: maskApiKey(apiKey),
    saveKey,
    removeKey
  };
};
