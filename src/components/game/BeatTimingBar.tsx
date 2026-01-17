import { useEffect, useState, useRef } from 'react';

interface BeatTimingBarProps {
  bpm: number;
  isPlaying: boolean;
  onBeatStart?: () => void;
}

export function BeatTimingBar({ bpm, isPlaying }: BeatTimingBarProps) {
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const msPerBeat = 60000 / bpm;

  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      return;
    }

    startTimeRef.current = performance.now();

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      const beatProgress = (elapsed % msPerBeat) / msPerBeat;

      setProgress(beatProgress * 100);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, msPerBeat]);

  return (
    <div className="beat-timing-container">
      <div className="beat-timing-label">Say the word NOW!</div>
      <div className="beat-timing-bar">
        {/* Background track */}
        <div className="beat-timing-track">
          {/* Green "sweet spot" zone in the middle */}
          <div className="beat-timing-sweetspot" />
        </div>
        {/* Moving indicator */}
        <div
          className="beat-timing-indicator"
          style={{ left: `${progress}%` }}
        />
      </div>
      <div className="beat-timing-markers">
        <span>Start</span>
        <span>End</span>
      </div>
    </div>
  );
}
