// ─── Message ──────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  status?: 'sending' | 'streaming' | 'done' | 'error'
  tokens?: number
  model?: string
}

// ─── Conversation ─────────────────────────────────────────────────────
export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  model: ChatModel
  systemPrompt?: string
  pinned?: boolean
  tags?: string[]
}

// ─── Models ──────────────────────────────────────────────────────────
export type ChatModel =
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001'

export interface ModelInfo {
  id: ChatModel
  name: string
  description: string
  contextWindow: number
  badge?: string
}

// ─── Settings ─────────────────────────────────────────────────────────
export interface ChatSettings {
  model: ChatModel
  systemPrompt: string
  temperature: number
  maxTokens: number
  streamingEnabled: boolean
  theme: 'dark' | 'light' | 'system'
  fontSize: 'sm' | 'md' | 'lg'
  sendOnEnter: boolean
}

// ─── API ──────────────────────────────────────────────────────────────
export interface ChatRequest {
  messages: Pick<Message, 'role' | 'content'>[]
  model: ChatModel
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatResponse {
  id: string
  content: string
  model: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export interface ApiError {
  error: string
  code?: string
  status?: number
}
