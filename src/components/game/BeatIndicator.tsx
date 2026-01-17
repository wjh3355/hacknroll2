interface BeatIndicatorProps {
  isOnBeat: boolean;
  bpm: number;
}

export function BeatIndicator({ isOnBeat, bpm }: BeatIndicatorProps) {
  return (
    <div className="beat-indicator-container">
      <div className={`beat-indicator ${isOnBeat ? 'pulse' : ''}`}>
        ♪
      </div>
      <div className="bpm-display">{bpm} BPM</div>
    </div>
  );
}
