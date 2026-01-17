import { useGame } from '../../contexts/GameContext';

export function GameOverScreen() {
  const { score, highScore, currentRound, lastSpokenWord, words, currentWordIndex, resetGame, startGame } = useGame();

  const isNewHighScore = score >= highScore && score > 0;
  const failedWord = words[currentWordIndex];

  return (
    <div className="screen game-over-screen">
      <h1 className="game-over-title">Game Over</h1>

      {isNewHighScore && (
        <div className="new-high-score">🎉 New High Score! 🎉</div>
      )}

      <div className="final-stats">
        <div className="final-stat">
          <span className="final-stat-label">Final Score</span>
          <span className="final-stat-value">{score}</span>
        </div>
        <div className="final-stat">
          <span className="final-stat-label">Round Reached</span>
          <span className="final-stat-value">{currentRound}</span>
        </div>
        <div className="final-stat">
          <span className="final-stat-label">High Score</span>
          <span className="final-stat-value">{Math.max(score, highScore)}</span>
        </div>
      </div>

      {failedWord && (
        <div className="failure-reason">
          <p>
            Expected: <strong>{failedWord.text}</strong>
          </p>
          <p>
            You said: <strong>{lastSpokenWord || '(nothing)'}</strong>
          </p>
        </div>
      )}

      <div className="game-over-actions">
        <button className="play-again-button" onClick={startGame}>
          Play Again
        </button>
        <button className="menu-button" onClick={resetGame}>
          Main Menu
        </button>
      </div>
    </div>
  );
}
