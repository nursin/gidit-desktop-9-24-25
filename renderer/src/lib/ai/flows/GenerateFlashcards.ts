'use server';

/**
 * Generates a deck of flashcards seeded by the provided topic.
 * This implementation is a deterministic placeholder until the
 * Genkit-backed flow is wired up. It keeps the API surface compatible
 * with the renderer components that consume it.
 */
export type GenerateFlashcardsInput = {
  topic: string;
  count?: number;
};

export type Flashcard = {
  front: string;
  back: string;
};

export type GenerateFlashcardsOutput = {
  cards: Flashcard[];
};

const cannedDecks: Record<string, Flashcard[]> = {
  biology: [
    { front: 'What is the basic unit of life?', back: 'The cell.' },
    { front: 'The powerhouse of the cell is...', back: 'The mitochondrion.' },
    { front: 'DNA stands for...', back: 'Deoxyribonucleic acid.' },
    { front: 'Which macromolecule stores genetic information?', back: 'Nucleic acids.' },
    { front: 'What process do plants use to create energy?', back: 'Photosynthesis.' },
  ],
  javascript: [
    { front: 'What keyword declares a constant?', back: 'const' },
    { front: 'Which array method creates a new array with filtered items?', back: 'Array.prototype.filter' },
    { front: 'What does `NaN` stand for?', back: 'Not a Number' },
    { front: 'How do you create a Promise that resolves immediately?', back: 'Promise.resolve(value)' },
    { front: 'Which keyword is used for asynchronous functions?', back: 'async' },
  ],
};

const defaultSeedCards: Flashcard[] = [
  {
    front: 'What is a key term associated with this topic? (replace the ellipsis)',
    back: 'Provide the main definition here.',
  },
  {
    front: 'Name one practical application related to the topic.',
    back: 'Describe a real-world use case.',
  },
  {
    front: 'Complete the sentence: The most important concept in this topic is ...',
    back: 'State the core idea in your own words.',
  },
];

export async function generateFlashcards(
  input: GenerateFlashcardsInput,
): Promise<GenerateFlashcardsOutput> {
  const topic = input.topic.trim();
  if (!topic) {
    return { cards: [] };
  }

  const normalizedTopic = topic.toLowerCase();
  const requestedCount = Math.max(1, Math.min(input.count ?? 10, 25));

  const seededDeck = cannedDecks[normalizedTopic] ?? buildSeededDeck(topic);
  const cards = expandDeck(seededDeck, requestedCount, topic);

  return { cards };
}

function buildSeededDeck(topic: string): Flashcard[] {
  return defaultSeedCards.map(({ front, back }) => ({
    front: front.replace('this topic', topic).replace('topic', topic),
    back: back.replace('the topic', topic).replace('topic', topic),
  }));
}

function expandDeck(baseDeck: Flashcard[], count: number, topic: string): Flashcard[] {
  if (baseDeck.length >= count) {
    return baseDeck.slice(0, count);
  }

  const deck: Flashcard[] = [...baseDeck];
  let index = 1;

  while (deck.length < count) {
    deck.push({
      front: `Describe aspect ${index} of ${topic}.`,
      back: `Key details about aspect ${index} of ${topic}.`,
    });
    index += 1;
  }

  return deck;
}
