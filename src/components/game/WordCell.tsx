import type { Word } from '../../types/game';

interface WordCellProps {
  word: Word;
  isHighlighted: boolean;
}

export function WordCell({ word, isHighlighted }: WordCellProps) {
  const getStatusClass = () => {
    if (word.status === 'correct') return 'correct';
    if (word.status === 'wrong') return 'wrong';
    if (word.status === 'missed') return 'missed';
    return '';
  };

  return (
    <div
      className={`word-cell ${isHighlighted ? 'highlighted' : ''} ${getStatusClass()}`}
    >
      {word.emoji}
    </div>
  );
}
