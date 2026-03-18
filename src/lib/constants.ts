import type { ModelInfo, ChatSettings } from '../types'

export const MODELS: ModelInfo[] = [
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    description: 'Smart & fast — ideal for most tasks',
    contextWindow: 200000,
    badge: 'Recommended',
  },
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    description: 'Most powerful — complex reasoning',
    contextWindow: 200000,
    badge: 'Powerful',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    description: 'Fastest & lightest — quick answers',
    contextWindow: 200000,
    badge: 'Fast',
  },
]

export const DEFAULT_SYSTEM_PROMPTS = [
  {
    label: 'Assistant',
    value: 'You are a helpful, harmless, and honest AI assistant.',
  },
  {
    label: 'Developer',
    value: 'You are an expert software engineer. Provide precise, well-commented code examples. Prefer TypeScript. Always explain your reasoning.',
  },
  {
    label: 'Code Reviewer',
    value: 'You are a senior code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and style inconsistencies. Be concise and actionable.',
  },
  {
    label: 'Technical Writer',
    value: 'You are a technical writer. Write clear, concise documentation. Use markdown formatting. Structure content with proper headings and examples.',
  },
  {
    label: 'Tutor',
    value: 'You are a patient tutor. Explain complex concepts using simple analogies. Break down problems step by step. Always check for understanding.',
  },
]

export const DEFAULT_SETTINGS: ChatSettings = {
  model: 'claude-sonnet-4-6',
  systemPrompt: DEFAULT_SYSTEM_PROMPTS[0].value,
  temperature: 0.7,
  maxTokens: 1024,
  streamingEnabled: true,
  theme: 'dark',
  fontSize: 'md',
  sendOnEnter: true,
}

export const FONT_SIZE_MAP = {
  sm: '13px',
  md: '14px',
  lg: '16px',
}

export const WELCOME_MESSAGES = [
  'What can I help you build today?',
  'Ask me anything — code, concepts, or creative ideas.',
  'Ready to think through your next challenge.',
  'How can I assist you today?',
]
