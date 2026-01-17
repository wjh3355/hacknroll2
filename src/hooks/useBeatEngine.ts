import { useCallback, useEffect, useRef, useState } from 'react';

interface BeatEngineOptions {
  bpm: number;
  onBeat: (beatNumber: number) => void;
  enabled: boolean;
}

interface BeatEngineReturn {
  currentBeat: number;
  isOnBeat: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useBeatEngine({
  bpm,
  onBeat,
  enabled,
}: BeatEngineOptions): BeatEngineReturn {
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [isOnBeat, setIsOnBeat] = useState(false);

  const startTimeRef = useRef<number>(0);
  const lastBeatRef = useRef<number>(-1);
  const animationFrameRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const msPerBeat = 60000 / bpm;

  const tick = useCallback(() => {
    if (!isRunningRef.current) return;

    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const beatNumber = Math.floor(elapsed / msPerBeat);

    if (beatNumber > lastBeatRef.current) {
      lastBeatRef.current = beatNumber;
      setCurrentBeat(beatNumber);
      setIsOnBeat(true);
      onBeat(beatNumber);

      // Reset isOnBeat after a short duration
      setTimeout(() => setIsOnBeat(false), 100);
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [msPerBeat, onBeat]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    startTimeRef.current = performance.now();
    lastBeatRef.current = -1;
    setCurrentBeat(-1);
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setCurrentBeat(-1);
    lastBeatRef.current = -1;
  }, [stop]);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => stop();
  }, [enabled, start, stop]);

  // Update tick callback when bpm changes
  useEffect(() => {
    if (isRunningRef.current) {
      // Restart with new BPM
      stop();
      start();
    }
  }, [bpm, start, stop]);

  return {
    currentBeat,
    isOnBeat,
    start,
    stop,
    reset,
  };
}
