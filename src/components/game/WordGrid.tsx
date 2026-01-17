import { WordCell } from './WordCell';
import type { Word } from '../../types/game';

interface WordGridProps {
  words: Word[];
  currentWordIndex: number;
}

export function WordGrid({ words, currentWordIndex }: WordGridProps) {
  return (
    <div className="word-grid">
      {words.map((word, index) => (
        <WordCell
          key={word.id}
          word={word}
          isHighlighted={index === currentWordIndex}
        />
      ))}
    </div>
  );
}
