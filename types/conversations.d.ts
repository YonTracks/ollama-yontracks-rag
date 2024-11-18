// types/conversations.d.ts

export interface Conversation {
  id: string; // Unique identifier (UUID)
  prompt: string;
  response: string;
  image?: string | undefined | null; // Optional base64 image
  timestamp: number; // Unix timestamp for sorting
}
