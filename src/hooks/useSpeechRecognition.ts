import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
}

interface SpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  error: string | null;
}

// Type definitions for Web Speech API
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface ISpeechRecognitionEvent extends Event {
  results: ISpeechRecognitionResultList;
  resultIndex: number;
}

interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Get the SpeechRecognition constructor
const getSpeechRecognition = (): (new () => ISpeechRecognition) | null => {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
};

export function useSpeechRecognition({
  onResult,
  onError,
  continuous = true,
  interimResults = true,
}: SpeechRecognitionOptions): SpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const isSupported = !!getSpeechRecognition();

  // Use refs for callbacks to avoid recreating recognition on every render
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  const start = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setError('Speech recognition not supported');
      onErrorRef.current('Speech recognition not supported in this browser');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('[Speech] Recognition started');
      setIsListening(true);
      setError(null);
      shouldRestartRef.current = true;
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      console.log('[Speech] onresult fired, results:', event.results.length);
      const result = event.results[event.results.length - 1];
      const transcriptText = result[0].transcript.trim().toLowerCase();
      const isFinal = result.isFinal;
      const confidence = result[0].confidence;

      console.log('[Speech] Transcript:', transcriptText, '| Final:', isFinal, '| Confidence:', confidence);

      setTranscript(transcriptText);
      onResultRef.current(transcriptText, isFinal);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.log('[Speech] Error:', event.error, event.message);

      switch (event.error) {
        case 'no-speech':
          // User didn't say anything - this is fine, just restart
          break;
        case 'audio-capture':
          setError('Microphone not accessible');
          onErrorRef.current('Microphone not accessible');
          shouldRestartRef.current = false;
          break;
        case 'not-allowed':
          setError('Microphone permission denied');
          onErrorRef.current('Microphone permission denied');
          shouldRestartRef.current = false;
          break;
        case 'network':
          setError('Network error');
          onErrorRef.current('Network error - speech recognition may be unavailable');
          break;
        case 'aborted':
          // Recognition was aborted - this is intentional
          break;
        default:
          // Try to recover from other errors
          setError(event.error);
      }
    };

    recognition.onend = () => {
      console.log('[Speech] Recognition ended, shouldRestart:', shouldRestartRef.current);
      setIsListening(false);

      // Auto-restart if we should still be listening
      if (shouldRestartRef.current) {
        setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            try {
              console.log('[Speech] Restarting recognition...');
              recognitionRef.current.start();
            } catch (e) {
              console.log('[Speech] Failed to restart:', e);
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition as ISpeechRecognition;

    try {
      recognition.start();
    } catch (e) {
      console.log('Failed to start speech recognition:', e);
      setError('Failed to start speech recognition');
    }
  }, [continuous, interimResults]);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    start,
    stop,
    error,
  };
}
