import type { Word } from '../types/game';

// Simple, common words that are easy to recognize by speech API
export const WORD_BANK = [
  // Animals
  'cat', 'dog', 'bird', 'fish', 'bear', 'lion', 'frog', 'duck',
  // Colors
  'red', 'blue', 'green', 'black', 'white', 'pink', 'gold', 'gray',
  // Numbers
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  // Actions
  'go', 'stop', 'run', 'jump', 'walk', 'talk', 'sing', 'dance',
  // Directions
  'up', 'down', 'left', 'right', 'in', 'out', 'yes', 'no',
  // Nature
  'sun', 'moon', 'star', 'tree', 'rain', 'snow', 'wind', 'rock',
  // Objects
  'book', 'ball', 'car', 'bus', 'hat', 'cup', 'box', 'key',
  // Adjectives
  'big', 'small', 'hot', 'cold', 'fast', 'slow', 'loud', 'soft',
];

export const getRandomWords = (count: number): Word[] => {
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((text, index) => ({
    id: `word-${index}-${Date.now()}`,
    text,
    position: index,
    status: 'pending',
  }));
};
