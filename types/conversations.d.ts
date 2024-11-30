// types/conversations.d.ts

export interface Conversation {
  id: string; // Unique identifier (UUID)
  prompt: string;
  response: string;
  image?: string | null;
  timestamp: number; // Unix timestamp for sorting
}
