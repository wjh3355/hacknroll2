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
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Get the SpeechRecognition constructor
const getSpeechRecognition = (): (new () => SpeechRecognition) | null => {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition ||
    null
  );
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

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const isSupported = !!getSpeechRecognition();

  const start = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setError('Speech recognition not supported');
      onError('Speech recognition not supported in this browser');
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
      setIsListening(true);
      setError(null);
      shouldRestartRef.current = true;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcriptText = result[0].transcript.trim().toLowerCase();
      const isFinal = result.isFinal;

      setTranscript(transcriptText);
      onResult(transcriptText, isFinal);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition error:', event.error);

      switch (event.error) {
        case 'no-speech':
          // User didn't say anything - this is fine, just restart
          break;
        case 'audio-capture':
          setError('Microphone not accessible');
          onError('Microphone not accessible');
          shouldRestartRef.current = false;
          break;
        case 'not-allowed':
          setError('Microphone permission denied');
          onError('Microphone permission denied');
          shouldRestartRef.current = false;
          break;
        case 'network':
          setError('Network error');
          onError('Network error - speech recognition may be unavailable');
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
      setIsListening(false);

      // Auto-restart if we should still be listening
      if (shouldRestartRef.current) {
        setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Failed to restart speech recognition:', e);
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.log('Failed to start speech recognition:', e);
      setError('Failed to start speech recognition');
    }
  }, [continuous, interimResults, onResult, onError]);

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
