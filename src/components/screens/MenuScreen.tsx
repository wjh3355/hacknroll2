import { useGame } from '../../contexts/GameContext';

export function MenuScreen() {
  const { startGame, highScore } = useGame();

  return (
    <div className="screen menu-screen">
      <h1 className="game-title">Say Words On Beat</h1>
      <p className="game-subtitle">Say each word when it's highlighted!</p>

      {highScore > 0 && (
        <div className="high-score">
          High Score: {highScore}
        </div>
      )}

      <button className="start-button" onClick={startGame}>
        Start Game
      </button>

      <div className="instructions">
        <h3>How to Play</h3>
        <ul>
          <li>Words will appear in a grid</li>
          <li>Say each word when it lights up</li>
          <li>Stay on beat - don't be too slow!</li>
          <li>Speed increases each round</li>
        </ul>
      </div>
    </div>
  );
}
