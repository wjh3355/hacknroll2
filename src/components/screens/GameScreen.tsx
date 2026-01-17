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

  // Get current expected word
  const currentWord = words[currentWordIndex]?.text || '';

  const hasResumedAudio = useRef(false);
  const wordValidatedRef = useRef(false);
  const resetListeningRef = useRef<(() => void) | null>(null);
  const stateRef = useRef(state);
  const currentWordRef = useRef(currentWord);
  const dispatchRef = useRef(dispatch);
  const playCorrectRef = useRef(playCorrect);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | 'missed' | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showRoundNotification, setShowRoundNotification] = useState(false);
  const lastRoundRef = useRef(currentRound);

  // Keep refs updated
  useEffect(() => {
    stateRef.current = state;
    currentWordRef.current = currentWord;
    dispatchRef.current = dispatch;
    playCorrectRef.current = playCorrect;
  }, [state, currentWord, dispatch, playCorrect]);

  // Show notification when round changes
  useEffect(() => {
    if (currentRound > lastRoundRef.current) {
      setShowRoundNotification(true);
      setTimeout(() => setShowRoundNotification(false), 1500);
      lastRoundRef.current = currentRound;
    }
  }, [currentRound]);

  // Handle speech recognition result - use refs to avoid recreating callback
  const handleSpeechResult = useCallback(
    (transcript: string, isFinal: boolean, alternatives: SpeechAlternative[]) => {
      console.log('[Game] handleSpeechResult called with:', transcript, '| Final:', isFinal);
      console.log('[Game] State:', stateRef.current, '| Already validated:', wordValidatedRef.current);

      if (stateRef.current !== 'playing' || wordValidatedRef.current) {
        console.log('[Game] Skipping - not playing or already validated');
        return;
      }

      // For interim results, only do quick exact matching
      if (!isFinal) {
        const lastWord = alternatives[0]?.transcript.toLowerCase().trim().split(' ').pop() || '';
        const expected = currentWordRef.current.toLowerCase();

        // Only exact match or very close match for interim results
        if (lastWord === expected || lastWord.includes(expected) || expected.includes(lastWord)) {
          console.log('[Game] Quick interim match:', lastWord);
          wordValidatedRef.current = true;
          setLastResult('correct');
          playCorrectRef.current();
          dispatchRef.current({
            type: 'ADVANCE_WORD',
            correct: true,
            spokenWord: lastWord,
          });
          resetListeningRef.current?.();
          setTimeout(() => setLastResult(null), 300);
        }
        return; // Don't do full matching for interim results
      }

      // For final results, do full fuzzy matching
      console.log('[Game] Checking', alternatives.length, 'alternatives against:', currentWordRef.current);
      const match = matchAnyAlternative(alternatives, currentWordRef.current);

      if (match) {
        // Correct word spoken
        console.log('[Game] SUCCESS! Matched with:', match.transcript);
        wordValidatedRef.current = true;
        setLastResult('correct');
        playCorrectRef.current();
        dispatchRef.current({
          type: 'ADVANCE_WORD',
          correct: true,
          spokenWord: match.transcript,
        });

        // Reset speech recognition to clear the buffer
        resetListeningRef.current?.();

        // Clear result indicator after a moment
        setTimeout(() => setLastResult(null), 300);
      }
    },
    [] // No dependencies - use refs instead
  );

  const handleSpeechError = useCallback((error: string) => {
    setSpeechError(error);
  }, []);

  const {
    isListening,
    transcript,
    start: startListening,
    stop: stopListening,
    reset: resetListening,
    error: recognitionError,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  // Store reset function in ref for use in match callback
  useEffect(() => {
    resetListeningRef.current = resetListening;
  }, [resetListening]);

  // Resume audio context on mount
  useEffect(() => {
    if (!hasResumedAudio.current) {
      resumeContext();
      hasResumedAudio.current = true;
    }
  }, [resumeContext]);

  // Start/stop speech recognition based on game state
  useEffect(() => {
    console.log('[GameScreen] Speech recognition effect running, state:', state, 'isListening:', isListening);
    if (state === 'playing' && !isListening) {
      console.log('[GameScreen] Starting speech recognition');
      startListening();
    } else if (state !== 'playing' && isListening) {
      console.log('[GameScreen] Stopping speech recognition (state not playing)');
      stopListening();
    }
    // Only run when state changes, not when functions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Cleanup only on actual unmount
  useEffect(() => {
    return () => {
      console.log('[GameScreen] Component unmounting - stopping speech recognition');
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle beat event
  const handleBeat = useCallback(
    (beatNumber: number) => {
      console.log('[Game] Beat', beatNumber, '| Word validated:', wordValidatedRef.current, '| Current word:', currentWordRef.current);
      // Play the beat tick sound
      playBeatTick();

      // Check if the previous word was validated
      // If we're past the first beat and the word wasn't validated, it's a miss
      if (beatNumber > 0 && !wordValidatedRef.current) {
        // Player missed the beat (didn't say anything or wrong word)
        console.log('[Game] MISS - word not validated');
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
      console.log('[Game] Resetting validation flag for new beat');
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
