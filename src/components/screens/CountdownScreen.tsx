import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GAME_CONFIG } from '../../utils/constants';
import { WordGrid } from '../game/WordGrid';

export function CountdownScreen() {
  const { words, dispatch } = useGame();
  const [count, setCount] = useState(GAME_CONFIG.countdownSeconds);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, start playing
      dispatch({ type: 'START_PLAYING' });
    }
  }, [count, dispatch]);

  return (
    <div className="screen countdown-screen">
      <div className="countdown-number">
        {count > 0 ? count : 'GO!'}
      </div>

      <p className="countdown-hint">Get ready to say the words!</p>

      {/* Show the grid so player can preview words */}
      <WordGrid words={words} currentWordIndex={-1} />
    </div>
  );
}
