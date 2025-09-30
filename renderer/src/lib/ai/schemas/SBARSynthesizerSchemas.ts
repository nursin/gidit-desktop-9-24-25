export type SupportingStatus = "supporting" | "contradicting";

export type LiteratureReviewItem = {
  title: string;
  summary: string;
  status: SupportingStatus;
};

export type PresentationSlide = {
  title: string;
  content: string[];
};

export type SbarSynthesizerOutput = {
  situation: string;
  background: string;
  assessment: string;
  recommendation: {
    text: string;
    successMetrics: string;
  };
  literature: LiteratureReviewItem[];
  pdfContent: string;
  presentationSlides: PresentationSlide[];
};

export type DocumentReference = {
  fileName: string;
  dataUri: string;
};

export type SbarSynthesizerInput = {
  notes: string;
  documents: DocumentReference[];
};
