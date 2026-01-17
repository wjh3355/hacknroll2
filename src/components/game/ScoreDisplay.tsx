import { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number;
  round: number;
  bpm: number;
}

export function ScoreDisplay({ score, round, bpm }: ScoreDisplayProps) {
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [lastScore, setLastScore] = useState(score);

  useEffect(() => {
    if (score > lastScore) {
      setShowScorePopup(true);
      setTimeout(() => setShowScorePopup(false), 300);
      setLastScore(score);
    }
  }, [score, lastScore]);

  return (
    <div className="game-header">
      <div className="stat">
        <span className="stat-label">Score</span>
        <span className={`stat-value ${showScorePopup ? 'score-popup' : ''}`}>
          {score}
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">Round</span>
        <span className="stat-value">{round}</span>
      </div>
      <div className="stat">
        <span className="stat-label">BPM</span>
        <span className="stat-value">{bpm}</span>
      </div>
    </div>
  );
}
