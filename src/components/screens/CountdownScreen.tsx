import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { GAME_CONFIG } from '../../utils/constants';
import { WordGrid } from '../game/WordGrid';

export function CountdownScreen() {
  const { words, dispatch } = useGame();
  const { playBeatTick, resumeContext } = useAudioPlayer();
  const [count, setCount] = useState(GAME_CONFIG.countdownSeconds);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const hasRequestedMic = useRef(false);

  // Request microphone permission
  useEffect(() => {
    if (hasRequestedMic.current) return;
    hasRequestedMic.current = true;

    // Resume audio context first (needs user interaction, which happened on menu click)
    resumeContext();

    // Request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setMicPermission('granted');
      })
      .catch(() => {
        setMicPermission('denied');
      });
  }, [resumeContext]);

  // Countdown with beat sounds
  useEffect(() => {
    if (micPermission !== 'granted') return;

    if (count > 0) {
      // Play beat tick on each countdown number
      playBeatTick();

      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Play final "GO" sound
      playBeatTick();

      // Short delay then start playing
      const startTimer = setTimeout(() => {
        dispatch({ type: 'START_PLAYING' });
      }, 500);
      return () => clearTimeout(startTimer);
    }
  }, [count, micPermission, dispatch, playBeatTick]);

  // Show mic permission request if pending or denied
  if (micPermission === 'pending') {
    return (
      <div className="screen countdown-screen">
        <div className="mic-permission">
          <div className="mic-icon">🎤</div>
          <h2>Microphone Access Required</h2>
          <p>Please allow microphone access to play the game.</p>
          <p className="mic-hint">The browser should show a permission prompt...</p>
        </div>
      </div>
    );
  }

  if (micPermission === 'denied') {
    return (
      <div className="screen countdown-screen">
        <div className="mic-permission error">
          <div className="mic-icon">🎤</div>
          <h2>Microphone Access Denied</h2>
          <p>This game requires microphone access to detect your voice.</p>
          <p className="mic-hint">Please enable microphone permissions in your browser settings and refresh.</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen countdown-screen">
      <div className="countdown-number">
        {count > 0 ? count : 'GO!'}
      </div>

      <p className="countdown-hint">Get ready to say the words!</p>

      {/* Show the grid so player can preview words */}
      <WordGrid words={words} currentWordIndex={-1} />

      <p className="countdown-tip">
        Say each word when it lights up. Stay on beat!
      </p>
    </div>
  );
}
