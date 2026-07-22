export interface ConversationPrompt {
  id: string;
  topic: string;
  text: string;
}

export const CONVERSATION_PROMPTS: ConversationPrompt[] = [
  {
    id: "daily-1",
    topic: "Daily life",
    text: "What does a typical weekday look like for you?",
  },
  {
    id: "daily-2",
    topic: "Daily life",
    text: "What’s one small habit that made your week better?",
  },
  {
    id: "food-1",
    topic: "Food",
    text: "Describe a meal you’d cook for a guest from another country.",
  },
  {
    id: "food-2",
    topic: "Food",
    text: "What’s a comfort food from your childhood, and why?",
  },
  {
    id: "travel-1",
    topic: "Travel",
    text: "If you had a free weekend anywhere, where would you go and why?",
  },
  {
    id: "travel-2",
    topic: "Travel",
    text: "Tell a short story about a trip that didn’t go as planned.",
  },
  {
    id: "work-1",
    topic: "Work & study",
    text: "What are you learning right now outside of English?",
  },
  {
    id: "work-2",
    topic: "Work & study",
    text: "Describe a project you’re proud of — what made it hard?",
  },
  {
    id: "work-3",
    topic: "Work & study",
    text: "Pretend I’m interviewing you. Introduce yourself and your strengths in one minute.",
  },
  {
    id: "work-4",
    topic: "Work & study",
    text: "Tell me about a challenge at work or school and how you handled it.",
  },
  {
    id: "opinion-1",
    topic: "Opinions",
    text: "Should schools teach more practical skills? Argue both sides briefly.",
  },
  {
    id: "opinion-2",
    topic: "Opinions",
    text: "Is remote work better than office work? Share your take.",
  },
  {
    id: "story-1",
    topic: "Stories",
    text: "Tell a two-minute story about a time you felt nervous and how it ended.",
  },
  {
    id: "story-2",
    topic: "Stories",
    text: "Describe your favorite place in your city as if I’m walking there with you.",
  },
  {
    id: "future-1",
    topic: "Future",
    text: "Where do you hope to be in five years — work, home, or skills?",
  },
  {
    id: "future-2",
    topic: "Future",
    text: "What’s one English goal for the next month, and how will you practice?",
  },
  {
    id: "fun-1",
    topic: "Fun",
    text: "Would you rather explore space or the deep ocean? Defend your choice.",
  },
  {
    id: "fun-2",
    topic: "Fun",
    text: "Invent a holiday that doesn’t exist yet. What happens on that day?",
  },
  {
    id: "hobbies-1",
    topic: "Hobbies",
    text: "What do you do for fun when you have a free evening?",
  },
  {
    id: "hobbies-2",
    topic: "Hobbies",
    text: "Teach me a hobby you love — how would a beginner start?",
  },
  {
    id: "hobbies-3",
    topic: "Hobbies",
    text: "Is there a hobby you’d like to try this year? What’s stopping you?",
  },
  {
    id: "culture-1",
    topic: "Culture",
    text: "Recommend a movie or series and explain why it’s worth watching.",
  },
  {
    id: "culture-2",
    topic: "Culture",
    text: "What kind of music helps you focus, relax, or feel energized?",
  },
  {
    id: "culture-3",
    topic: "Culture",
    text: "Describe a book, podcast, or show that changed how you think.",
  },
  {
    id: "tech-1",
    topic: "Tech",
    text: "Which app do you use every day, and how does it help you?",
  },
  {
    id: "tech-2",
    topic: "Tech",
    text: "How has AI changed your study or work — for better or worse?",
  },
  {
    id: "tech-3",
    topic: "Tech",
    text: "Would you live without a smartphone for a week? Why or why not?",
  },
];

export function pickRandomPrompt(
  excludeId?: string | null,
  pool?: ConversationPrompt[]
): ConversationPrompt {
  const source = pool && pool.length > 0 ? pool : CONVERSATION_PROMPTS;
  const filtered =
    excludeId != null ? source.filter((p) => p.id !== excludeId) : source;
  const list = filtered.length > 0 ? filtered : source;
  return list[Math.floor(Math.random() * list.length)]!;
}
