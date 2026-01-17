import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { WordGrid } from '../game/WordGrid';
import { BeatIndicator } from '../game/BeatIndicator';
import { BeatTimingBar } from '../game/BeatTimingBar';
import { SpeechFeedback } from '../game/SpeechFeedback';
import { ScoreDisplay } from '../game/ScoreDisplay';
import { useBeatEngine } from '../../hooks/useBeatEngine';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useSpeechRecognition, type SpeechAlternative } from '../../hooks/useSpeechRecognition';
import { matchAnyAlternative } from '../../utils/speechMatcher';

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

  const { playBeatTick, playCorrect, playWrong, resumeContext } = useAudioPlayer();
  const hasResumedAudio = useRef(false);
  const wordValidatedRef = useRef(false);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | 'missed' | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showRoundNotification, setShowRoundNotification] = useState(false);
  const lastRoundRef = useRef(currentRound);

  // Get current expected word
  const currentWord = words[currentWordIndex]?.text || '';

  // Show notification when round changes
  useEffect(() => {
    if (currentRound > lastRoundRef.current) {
      setShowRoundNotification(true);
      setTimeout(() => setShowRoundNotification(false), 1500);
      lastRoundRef.current = currentRound;
    }
  }, [currentRound]);

  // Handle speech recognition result
  const handleSpeechResult = useCallback(
    (transcript: string, _isFinal: boolean, alternatives: SpeechAlternative[]) => {
      console.log('[Game] handleSpeechResult called with:', transcript);
      console.log('[Game] State:', state, '| Already validated:', wordValidatedRef.current);
      console.log('[Game] Checking', alternatives.length, 'alternatives against:', currentWord);

      if (state !== 'playing' || wordValidatedRef.current) {
        console.log('[Game] Skipping - not playing or already validated');
        return;
      }

      // Check ALL alternatives for a match
      const match = matchAnyAlternative(alternatives, currentWord);

      if (match) {
        // Correct word spoken
        console.log('[Game] SUCCESS! Matched with:', match.transcript);
        wordValidatedRef.current = true;
        setLastResult('correct');
        playCorrect();
        dispatch({
          type: 'ADVANCE_WORD',
          correct: true,
          spokenWord: match.transcript,
        });

        // Clear result indicator after a moment
        setTimeout(() => setLastResult(null), 300);
      }
    },
    [state, currentWord, dispatch, playCorrect]
  );

  const handleSpeechError = useCallback((error: string) => {
    setSpeechError(error);
  }, []);

  const {
    isListening,
    transcript,
    start: startListening,
    stop: stopListening,
    error: recognitionError,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  // Resume audio context on mount
  useEffect(() => {
    if (!hasResumedAudio.current) {
      resumeContext();
      hasResumedAudio.current = true;
    }
  }, [resumeContext]);

  // Start/stop speech recognition based on game state
  useEffect(() => {
    if (state === 'playing') {
      startListening();
    } else {
      stopListening();
    }

    return () => stopListening();
  }, [state, startListening, stopListening]);

  // Handle beat event
  const handleBeat = useCallback(
    (beatNumber: number) => {
      // Play the beat tick sound
      playBeatTick();

      // Check if the previous word was validated
      // If we're past the first beat and the word wasn't validated, it's a miss
      if (beatNumber > 0 && !wordValidatedRef.current) {
        // Player missed the beat (didn't say anything or wrong word)
        setLastResult('missed');
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
    },
    [playBeatTick, playWrong, dispatch]
  );

  const { isOnBeat } = useBeatEngine({
    bpm: currentBpm,
    onBeat: handleBeat,
    enabled: state === 'playing',
  });

  // Keyboard fallback for testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== 'playing') return;

      // Press space to simulate saying the correct word (for testing)
      if (e.code === 'Space') {
        e.preventDefault();
        if (!wordValidatedRef.current) {
          wordValidatedRef.current = true;
          setLastResult('correct');
          playCorrect();
          dispatch({
            type: 'ADVANCE_WORD',
            correct: true,
            spokenWord: words[currentWordIndex]?.text || null,
          });
          setTimeout(() => setLastResult(null), 300);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, dispatch, words, currentWordIndex, playCorrect]);

  return (
    <div className="screen game-screen">
      <ScoreDisplay score={score} round={currentRound} bpm={currentBpm} />

      {showRoundNotification && (
        <div className="round-notification">
          Round {currentRound}! Speed up!
        </div>
      )}

      <BeatIndicator isOnBeat={isOnBeat} bpm={currentBpm} />

      <BeatTimingBar bpm={currentBpm} isPlaying={state === 'playing'} />

      <WordGrid words={words} currentWordIndex={currentWordIndex} />

      <SpeechFeedback
        isListening={isListening}
        transcript={transcript}
        error={speechError || recognitionError}
        expectedWord={currentWord}
        lastResult={lastResult}
      />
    </div>
  );
}
