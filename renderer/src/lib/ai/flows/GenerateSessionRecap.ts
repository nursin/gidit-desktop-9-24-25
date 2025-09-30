'use server';

export type GenerateSessionRecapInput = {
  recentTasks: string;
};

export type GenerateSessionRecapOutput = {
  recap: string;
};

export async function generateSessionRecap(
  input: GenerateSessionRecapInput,
): Promise<GenerateSessionRecapOutput> {
  const recap = `You wrapped up these highlights:\n- ${input.recentTasks.replace(/,\s*/g, '\n- ')}\n\nReady to pick up where you left off? Focus on the next actionable step and keep the momentum going.`;

  return { recap };
}
