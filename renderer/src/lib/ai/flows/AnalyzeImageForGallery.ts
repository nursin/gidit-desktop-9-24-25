'use server';

/**
 * Lightweight image "analysis" placeholder for local development.
 * Produces deterministic metadata so UI flows can be exercised
 * without the Genkit pipeline in place.
 */
export type AnalyzeImageForGalleryInput = {
  imageDataUri: string;
};

export type ImageAnalysis = {
  title: string;
  description: string;
  categories: string[];
  extractedText: string;
};

export async function analyzeImageForGallery(
  input: AnalyzeImageForGalleryInput,
): Promise<ImageAnalysis> {
  const digest = hash(input.imageDataUri);
  const topic = topicFromHash(digest);
  const categories = buildCategories(digest, topic.primary);

  return {
    title: `${topic.primary} snapshot`,
    description: `Auto-tagged as ${topic.primary.toLowerCase()} with hints of ${topic.secondary.toLowerCase()}. Adjust as needed.`,
    categories,
    extractedText: topic.hasText ? sampleExtractedText(topic.primary) : '',
  };
}

const CATEGORY_POOL = [
  'Memories',
  'People',
  'Outdoors',
  'Food',
  'Architecture',
  'Work',
  'Documents',
  'Abstract',
  'Events',
  'Travel',
  'Objects',
  'Pets',
  'Art',
];

function hash(value: string): number {
  let acc = 0;
  for (let idx = 0; idx < value.length; idx += 1) {
    acc = (acc << 5) - acc + value.charCodeAt(idx);
    acc |= 0;
  }
  return Math.abs(acc);
}

function topicFromHash(digest: number) {
  const index = digest % TOPIC_PRESETS.length;
  return TOPIC_PRESETS[index];
}

type TopicPreset = {
  primary: string;
  secondary: string;
  hasText: boolean;
};

const TOPIC_PRESETS: TopicPreset[] = [
  { primary: 'Nature', secondary: 'Outdoors', hasText: false },
  { primary: 'Team', secondary: 'Work', hasText: false },
  { primary: 'Recipe', secondary: 'Food', hasText: true },
  { primary: 'Document', secondary: 'Work', hasText: true },
  { primary: 'Artwork', secondary: 'Abstract', hasText: false },
  { primary: 'Adventure', secondary: 'Travel', hasText: false },
  { primary: 'Pet', secondary: 'Memories', hasText: false },
];

function buildCategories(digest: number, primary: string): string[] {
  const categories = new Set<string>();
  categories.add(primary);

  const count = 2 + (digest % 2);
  for (let i = 0; categories.size < count; i += 1) {
    const pick = CATEGORY_POOL[(digest + i * 7) % CATEGORY_POOL.length];
    categories.add(pick);
  }
  return Array.from(categories);
}

function sampleExtractedText(topic: string): string {
  switch (topic) {
    case 'Document':
      return 'CONFIDENTIAL\nProject Titan Kickoff Agenda\n1. Introductions\n2. Milestone review\n3. Action items';
    case 'Recipe':
      return 'Ingredients:\n- 2 cups flour\n- 1 cup sugar\n- 3 eggs\nDirections: mix, bake at 350°F for 25 minutes.';
    default:
      return '';
  }
}
