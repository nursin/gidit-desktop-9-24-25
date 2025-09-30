'use server';

export type PsychologicalProfileSection = {
  title: string;
  summary: string;
  bulletPoints: string[];
};

export type PsychologicalProfile = {
  overallSummary: string;
  strengths: PsychologicalProfileSection;
  areasForImprovement: PsychologicalProfileSection;
  professionalDevelopment: PsychologicalProfileSection;
};

export type GeneratePsychologicalProfileInput = {
  activitySummary: string;
};

export type GeneratePsychologicalProfileOutput = PsychologicalProfile;

export async function generatePsychologicalProfile(
  _input: GeneratePsychologicalProfileInput,
): Promise<GeneratePsychologicalProfileOutput> {
  return buildMockProfile();
}

function buildMockProfile(): PsychologicalProfile {
  return {
    overallSummary:
      'Your recent activity showcases a structured, goal-oriented mindset with steady focus blocks and a strong bias toward execution. You thrive when projects mix creativity with analytical problem solving.',
    strengths: {
      title: 'Core Strengths',
      summary:
        'You excel at translating ideas into action, maintaining momentum through consistent focus sessions, and adapting quickly when new opportunities emerge.',
      bulletPoints: [
        'High completion rate on urgent and important tasks.',
        'Balances analytical planning with creative brainstorming.',
        'Harnesses routines (morning focus blocks) to stay in flow.',
      ],
    },
    areasForImprovement: {
      title: 'Growth Areas',
      summary:
        'You occasionally defer less urgent projects and can lose momentum when external interruptions occur. Planning recovery time can keep quality high.',
      bulletPoints: [
        'Guard against context-switching to protect creative energy.',
        'Schedule decompression after demanding tasks to prevent burnout.',
        'Experiment with weekend rituals to maintain baseline mood.',
      ],
    },
    professionalDevelopment: {
      title: 'Professional Development',
      summary:
        'Pair your execution strength with more frequent reflection cycles. Capture insights after each sprint to refine strategy and make space for mentorship.',
      bulletPoints: [
        'Host a weekly 15-minute retro to capture learnings.',
        'Share knowledge artifacts or office hours with peers.',
        'Pursue projects that blend technical rigor with narrative storytelling.',
      ],
    },
  };
}
