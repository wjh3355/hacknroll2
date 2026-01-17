import { useCallback, useRef, useEffect } from 'react';

interface AudioPlayerReturn {
  playBeatTick: () => void;
  playCorrect: () => void;
  playWrong: () => void;
  resumeContext: () => Promise<void>;
}

// Create a global AudioContext (lazy initialization)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Generate a simple beat tick sound
function playTick(frequency: number = 800, duration: number = 0.05, volume: number = 0.3) {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Generate success sound (ascending tone)
function playSuccessSound() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
}

// Generate failure sound (descending tone)
function playFailureSound() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(300, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
}

export function useAudioPlayer(): AudioPlayerReturn {
  const isResumedRef = useRef(false);

  // Resume AudioContext on user interaction
  const resumeContext = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
      isResumedRef.current = true;
    }
  }, []);

  const playBeatTick = useCallback(() => {
    playTick(600, 0.08, 0.4);
  }, []);

  const playCorrect = useCallback(() => {
    playSuccessSound();
  }, []);

  const playWrong = useCallback(() => {
    playFailureSound();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Don't close the context as it's shared globally
    };
  }, []);

  return {
    playBeatTick,
    playCorrect,
    playWrong,
    resumeContext,
  };
}
