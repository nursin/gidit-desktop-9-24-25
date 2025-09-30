'use server';

import type {
  SbarSynthesizerInput,
  SbarSynthesizerOutput,
} from "@/lib/ai/schemas/SBARSynthesizerSchemas";

export async function synthesizeSbarReport(
  input: SbarSynthesizerInput,
): Promise<SbarSynthesizerOutput> {
  return buildMockReport(input);
}

function buildMockReport(input: SbarSynthesizerInput): SbarSynthesizerOutput {
  const baseText = input.notes.trim().slice(0, 120) || "No notes provided.";

  return {
    situation: `Summary: ${baseText}...`,
    background:
      'Client has a strong execution record over the past month with consistent focus blocks and high adherence to urgent priorities.',
    assessment:
      'Patterns indicate momentum with creative initiatives; consider shoring up recovery rituals to avoid scope creep.',
    recommendation: {
      text: 'Prioritize a weekly checkpoint to review progress and unblock critical dependencies.',
      successMetrics: 'Complete 3 high-priority tasks per week with <10% rollover.',
    },
    literature: [
      {
        title: 'Habit Stacking Improves Task Completion',
        summary: 'A meta-analysis finds pairing new habits with existing routines increases adherence by 37%.',
        status: 'supporting',
      },
      {
        title: 'Context Switching and Productivity Loss',
        summary: 'Research shows cognitive switching reduces throughput by up to 20%, reinforcing the need for scheduled focus blocks.',
        status: 'supporting',
      },
      {
        title: 'Creative Recovery Windows',
        summary: 'Small rest intervals following intense work restore idea quality and lower burnout risk.',
        status: 'supporting',
      },
    ],
    pdfContent:
      'SBAR Report\n\nSituation:\n- Summary of key issues\n\nBackground:\n- Historical context\n\nAssessment:\n- Current analysis\n\nRecommendation:\n- Actionable next steps',
    presentationSlides: [
      {
        title: 'Situation',
        content: [
          'Key issues synthesized from recent notes.',
          'Stakeholders aligned on objective.',
        ],
      },
      {
        title: 'Background',
        content: [
          '30-day activity review.',
          'Focus on urgent + important tasks.',
        ],
      },
      {
        title: 'Assessment',
        content: [
          'Momentum is strong with creative execution.',
          'Need guardrails for sustainable pacing.',
        ],
      },
      {
        title: 'Recommendation',
        content: [
          'Hold weekly strategic checkpoint.',
          'Define success metrics for each sprint.',
        ],
      },
    ],
  };
}
