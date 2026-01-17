import { useGame } from '../../contexts/GameContext';
import { WordGrid } from '../game/WordGrid';

export function GameScreen() {
  const { words, currentWordIndex, score, currentRound, currentBpm } = useGame();

  return (
    <div className="screen game-screen">
      <div className="game-header">
        <div className="stat">
          <span className="stat-label">Score</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Round</span>
          <span className="stat-value">{currentRound}</span>
        </div>
        <div className="stat">
          <span className="stat-label">BPM</span>
          <span className="stat-value">{currentBpm}</span>
        </div>
      </div>

      <div className="beat-indicator" id="beat-indicator">
        ♪
      </div>

      <WordGrid words={words} currentWordIndex={currentWordIndex} />

      <div className="speech-feedback" id="speech-feedback">
        <span className="listening-indicator">🎤 Listening...</span>
      </div>
    </div>
  );
}
