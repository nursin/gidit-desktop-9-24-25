'use server';

export type GenerateStoryInput = {
  prompt: string;
};

export type GenerateStoryOutput = {
  story: string;
};

export async function generateStory(
  input: GenerateStoryInput,
): Promise<GenerateStoryOutput> {
  const synopsis = input.prompt.trim() || 'An untitled adventure';
  const paragraphs = [
    `Chapter 1 — Spark: ${synopsis}.` ,
    'Chapter 2 — Rising Action: What begins as a simple idea unfurls into unexpected complications, revealing allies, rivals, and the stakes that now feel personal.',
    'Chapter 3 — Turning Point: When doubt peaks, an overlooked detail becomes the key that reframes every step taken so far.',
    'Chapter 4 — Resolution: With clarity and determination, the protagonist embraces the lesson, carrying its echo into the next horizon.'
  ];
  return { story: paragraphs.join('\n\n') };
}
