export type InterviewQuestionType = "text" | "textarea" | "select" | "chips" | "optional-textarea";

export type InterviewQuestion = {
  id: string;
  question: string;
  hint: string;
  type: InterviewQuestionType;
  required?: boolean;
  options?: { value: string; label: string }[];
  chipOptions?: { value: string; label: string }[];
  prefillFrom?: "name";
};

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "gymName",
    question: "What's your gym called?",
    hint: "Use your official business name — it appears in the header and search results.",
    type: "text",
    required: true,
    prefillFrom: "name",
  },
  {
    id: "city",
    question: "What city or area do you serve?",
    hint: "Local search works best when your city or neighborhood is clear.",
    type: "text",
    required: true,
  },
  {
    id: "differentiator",
    question: "In one sentence, what makes your gym different?",
    hint: "Think: equipment, coaching, community, or vibe.",
    type: "textarea",
    required: true,
  },
  {
    id: "idealMember",
    question: "Who is your ideal member?",
    hint: "Beginners, powerlifters, athletes, busy parents — be specific.",
    type: "select",
    required: true,
    options: [
      { value: "beginners", label: "Beginners learning the basics" },
      { value: "general", label: "General fitness members" },
      { value: "strength", label: "Serious strength athletes" },
      { value: "competitive", label: "Competitive lifters / CrossFit" },
      { value: "other", label: "Other (describe below)" },
    ],
  },
  {
    id: "vibe",
    question: "How would you describe the vibe?",
    hint: "Pick all that fit — we will match your tone in the copy.",
    type: "chips",
    required: true,
    chipOptions: [
      { value: "hardcore", label: "Hardcore" },
      { value: "welcoming", label: "Welcoming" },
      { value: "competitive", label: "Competitive" },
      { value: "community", label: "Community-focused" },
      { value: "no-nonsense", label: "No-nonsense" },
      { value: "premium", label: "Premium" },
    ],
  },
  {
    id: "offerings",
    question: "What do you offer?",
    hint: "Select everything members can sign up for.",
    type: "chips",
    required: true,
    chipOptions: [
      { value: "open-gym", label: "Open gym" },
      { value: "classes", label: "Group classes" },
      { value: "personal-training", label: "Personal training" },
      { value: "powerlifting", label: "Powerlifting" },
      { value: "strongman", label: "Strongman" },
      { value: "24-7", label: "24/7 access" },
    ],
  },
  {
    id: "extras",
    question: "Anything else search engines or social posts should highlight?",
    hint: "Amenities, events, parking, pricing hooks — optional.",
    type: "optional-textarea",
    required: false,
  },
];

export const INTERVIEW_STEP_COUNT = INTERVIEW_QUESTIONS.length;

export const estimateMinutesRemaining = (stepIndex: number) => {
  const remaining = INTERVIEW_QUESTIONS.length - stepIndex;
  return Math.max(1, Math.ceil((remaining * 15) / 60));
};

export const isInterviewStepOptional = (question: InterviewQuestion) => question.required === false;
