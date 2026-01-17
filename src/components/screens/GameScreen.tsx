import { useCallback, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { WordGrid } from '../game/WordGrid';
import { BeatIndicator } from '../game/BeatIndicator';
import { useBeatEngine } from '../../hooks/useBeatEngine';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { GAME_CONFIG } from '../../utils/constants';

export function GameScreen() {
  const {
    words,
    currentWordIndex,
    score,
    currentRound,
    currentBpm,
    state,
    dispatch,
  } = useGame();

  const { playBeatTick, playWrong, resumeContext } = useAudioPlayer();
  const hasResumedAudio = useRef(false);
  const wordValidatedRef = useRef(false);

  // Resume audio context on first interaction
  useEffect(() => {
    if (!hasResumedAudio.current) {
      resumeContext();
      hasResumedAudio.current = true;
    }
  }, [resumeContext]);

  // Handle beat event
  const handleBeat = useCallback(
    (beatNumber: number) => {
      // Play the beat tick sound
      playBeatTick();

      // Check if the previous word was validated
      // If we're past the first beat and the word wasn't validated, it's a miss
      if (beatNumber > 0 && !wordValidatedRef.current) {
        // Player missed the beat (didn't say anything)
        playWrong();
        dispatch({
          type: 'ADVANCE_WORD',
          correct: false,
          spokenWord: null,
        });
        return;
      }

      // Reset validation flag for the new beat
      wordValidatedRef.current = false;

      // Handle round completion (after 8 words)
      const currentIndex = currentWordIndex;
      if (currentIndex === 0 && beatNumber > 0 && beatNumber % GAME_CONFIG.wordsPerRound === 0) {
        // New round - get new words
        dispatch({ type: 'NEXT_ROUND' });
      }
    },
    [playBeatTick, playWrong, dispatch, currentWordIndex]
  );

  const { isOnBeat } = useBeatEngine({
    bpm: currentBpm,
    onBeat: handleBeat,
    enabled: state === 'playing',
  });

  // Expose validation function for speech recognition (will be used in Phase 3)
  // For now, this is a placeholder
  useEffect(() => {
    // This effect will be updated in Phase 3 to connect speech recognition
    // For testing, we can add keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== 'playing') return;

      // Press space to simulate saying the correct word (for testing)
      if (e.code === 'Space') {
        e.preventDefault();
        wordValidatedRef.current = true;
        dispatch({
          type: 'ADVANCE_WORD',
          correct: true,
          spokenWord: words[currentWordIndex]?.text || null,
        });
      }

      // Press X to simulate saying the wrong word (for testing)
      if (e.code === 'KeyX') {
        e.preventDefault();
        wordValidatedRef.current = true;
        playWrong();
        dispatch({
          type: 'ADVANCE_WORD',
          correct: false,
          spokenWord: 'wrong',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, dispatch, words, currentWordIndex, playWrong]);

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

      <BeatIndicator isOnBeat={isOnBeat} bpm={currentBpm} />

      <WordGrid words={words} currentWordIndex={currentWordIndex} />

      <div className="speech-feedback" id="speech-feedback">
        <span className="listening-indicator">🎤 Listening...</span>
        <p className="test-hint">(Press SPACE to simulate correct, X for wrong)</p>
      </div>
    </div>
  );
}
