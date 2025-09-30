'use server';

/**
 * Deterministic mock implementation for the future Genkit-powered
 * health summary generator. Produces a structured summary so the UI
 * can render realistic content during local development.
 */
export type GenerateHealthSummaryInput = {
  documentDataUri: string;
};

export type GenerateHealthSummaryOutput = {
  comprehensiveSummary: string;
};

export async function generateHealthSummary(
  input: GenerateHealthSummaryInput,
): Promise<GenerateHealthSummaryOutput> {
  const digest = hash(input.documentDataUri);
  const profile = pickProfile(digest);
  const summary = buildSummary(profile, digest);
  return { comprehensiveSummary: summary };
}

type SummaryProfile = {
  patientName: string;
  age: number;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  assessment: string;
  plan: string[];
};

const SUMMARY_PRESETS: SummaryProfile[] = [
  {
    patientName: 'Jordan Taylor',
    age: 34,
    chiefComplaint: 'persistent headache and intermittent blurred vision',
    historyOfPresentIllness:
      'Symptoms began three weeks ago after extended screen time. Over-the-counter analgesics provide temporary relief. No associated nausea or vomiting.',
    assessment: 'Likely tension-type headaches with digital eye strain. Neurologic exam non-focal.',
    plan: [
      'Recommend blue-light filtering lenses and 20-20-20 eye breaks.',
      'Start magnesium glycinate 400 mg nightly for headache prophylaxis.',
      'Schedule follow-up in 4 weeks; escalate to neuro consult if no improvement.',
    ],
  },
  {
    patientName: 'Alex Morgan',
    age: 58,
    chiefComplaint: 'progressive shortness of breath on exertion',
    historyOfPresentIllness:
      'Symptoms worsened over the past two months, especially when climbing stairs. Denies chest pain, but notes occasional ankle swelling.',
    assessment: 'Concern for early heart failure with preserved ejection fraction; differential includes deconditioning.',
    plan: [
      'Order echocardiogram and basic metabolic panel.',
      'Initiate low-sodium diet with fluid tracking.',
      'Start supervised cardiac rehabilitation program.',
    ],
  },
  {
    patientName: 'Casey Rivera',
    age: 26,
    chiefComplaint: 'ongoing abdominal discomfort and bloating',
    historyOfPresentIllness:
      'Symptoms tied to certain meals; reports improvement with elimination of dairy. No weight loss or GI bleeding.',
    assessment: 'Most consistent with lactose intolerance versus irritable bowel syndrome.',
    plan: [
      'Continue lactose-free diet; refer to nutrition for guidance.',
      'Trial low FODMAP regimen if symptoms persist.',
      'Order celiac serology to complete workup.',
    ],
  },
];

function hash(value: string): number {
  let acc = 0;
  for (let index = 0; index < value.length; index += 1) {
    acc = (acc << 5) - acc + value.charCodeAt(index);
    acc |= 0;
  }
  return Math.abs(acc);
}

function pickProfile(digest: number): SummaryProfile {
  return SUMMARY_PRESETS[digest % SUMMARY_PRESETS.length];
}

function buildSummary(profile: SummaryProfile, digest: number): string {
  const encounterDate = formatDate(digest);
  const vitals = randomVitals(digest);

  return [
    `Date of Encounter: ${encounterDate}`,
    `Patient: ${profile.patientName}, ${profile.age} years old`,
    '',
    'Chief Complaint:',
    `- ${profile.chiefComplaint}`,
    '',
    'History of Present Illness:',
    profile.historyOfPresentIllness,
    '',
    'Vital Signs:',
    vitals,
    '',
    'Assessment:',
    `- ${profile.assessment}`,
    '',
    'Plan:',
    ...profile.plan.map((item, idx) => `${idx + 1}. ${item}`),
  ].join('\n');
}

function formatDate(digest: number): string {
  const base = new Date('2024-01-01T09:00:00Z');
  base.setDate(base.getDate() + (digest % 90));
  return base.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function randomVitals(digest: number): string {
  const heartRate = 60 + (digest % 25);
  const systolic = 110 + (digest % 15);
  const diastolic = 70 + (digest % 10);
  const temperature = 97.3 + ((digest % 7) * 0.1);
  return `HR ${heartRate} bpm | BP ${systolic}/${diastolic} mmHg | Temp ${temperature.toFixed(1)}°F | SpO₂ 98%`;
}
