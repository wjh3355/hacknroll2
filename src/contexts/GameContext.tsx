import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameSession, GameAction } from '../types/game';
import { GAME_CONFIG, HIGH_SCORE_KEY } from '../utils/constants';
import { getRandomWords } from '../utils/wordBank';

const initialState: GameSession = {
  state: 'menu',
  currentRound: 1,
  currentBpm: GAME_CONFIG.initialBpm,
  score: 0,
  currentWordIndex: 0,
  words: [],
  lastSpokenWord: null,
  highScore: 0,
};

function gameReducer(state: GameSession, action: GameAction): GameSession {
  switch (action.type) {
    case 'START_COUNTDOWN':
      return {
        ...state,
        state: 'countdown',
        currentRound: 1,
        currentBpm: GAME_CONFIG.initialBpm,
        score: 0,
        currentWordIndex: 0,
        words: getRandomWords(GAME_CONFIG.wordsPerRound),
        lastSpokenWord: null,
      };

    case 'START_PLAYING':
      return {
        ...state,
        state: 'playing',
      };

    case 'ADVANCE_WORD': {
      const newWords = [...state.words];
      newWords[state.currentWordIndex] = {
        ...newWords[state.currentWordIndex],
        status: action.correct ? 'correct' : (action.spokenWord ? 'wrong' : 'missed'),
      };

      // Check if game should end (wrong word or silence)
      if (!action.correct) {
        return {
          ...state,
          words: newWords,
          lastSpokenWord: action.spokenWord,
          state: 'gameOver',
        };
      }

      const nextIndex = state.currentWordIndex + 1;

      // Check if round is complete
      if (nextIndex >= GAME_CONFIG.wordsPerRound) {
        // Calculate round bonus
        const roundBonus = 500 * state.currentRound;
        return {
          ...state,
          words: getRandomWords(GAME_CONFIG.wordsPerRound), // Get new words for next round
          lastSpokenWord: action.spokenWord,
          score: state.score + 100 + roundBonus,
          currentWordIndex: 0,
          currentRound: state.currentRound + 1,
          currentBpm: Math.min(
            state.currentBpm + GAME_CONFIG.bpmIncrement,
            GAME_CONFIG.maxBpm
          ),
        };
      }

      return {
        ...state,
        words: newWords,
        lastSpokenWord: action.spokenWord,
        score: state.score + 100,
        currentWordIndex: nextIndex,
      };
    }

    case 'NEXT_ROUND':
      return {
        ...state,
        words: getRandomWords(GAME_CONFIG.wordsPerRound),
        currentWordIndex: 0,
      };

    case 'SET_WORDS':
      return {
        ...state,
        words: action.words,
      };

    case 'END_GAME':
      return {
        ...state,
        state: 'gameOver',
      };

    case 'UPDATE_HIGH_SCORE':
      return {
        ...state,
        highScore: action.score,
      };

    case 'RESET':
      return {
        ...initialState,
        highScore: state.highScore,
      };

    default:
      return state;
  }
}

interface GameContextValue extends GameSession {
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load high score from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    if (stored) {
      dispatch({ type: 'UPDATE_HIGH_SCORE', score: parseInt(stored, 10) });
    }
  }, []);

  // Save high score when game ends
  useEffect(() => {
    if (state.state === 'gameOver' && state.score > state.highScore) {
      localStorage.setItem(HIGH_SCORE_KEY, state.score.toString());
      dispatch({ type: 'UPDATE_HIGH_SCORE', score: state.score });
    }
  }, [state.state, state.score, state.highScore]);

  const startGame = () => {
    dispatch({ type: 'START_COUNTDOWN' });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <GameContext.Provider value={{ ...state, dispatch, startGame, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
