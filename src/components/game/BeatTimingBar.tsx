import { useEffect, useState, useRef } from 'react';

interface BeatTimingBarProps {
  bpm: number;
  isPlaying: boolean;
}

export function BeatTimingBar({ bpm, isPlaying }: BeatTimingBarProps) {
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const msPerBeat = 60000 / bpm;

  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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
      <div className="beat-timing-label">Time until next beat</div>
      <div className="beat-timing-bar">
        <div className="beat-timing-progress" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

