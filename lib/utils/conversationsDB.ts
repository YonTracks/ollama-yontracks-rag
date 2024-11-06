// lib/utils/conversationsDB.ts

import { openDB, DBSchema, IDBPDatabase } from "idb";

import { Conversation } from "@/types/conversations";

// Define the database schema
interface MyAppDB extends DBSchema {
  conversations: {
    key: string; // Using UUID as the key
    value: Conversation;
    indexes: { "by-prompt": string };
  };
}

// Initialize the database
let dbPromise: Promise<IDBPDatabase<MyAppDB>> | null = null;

if (typeof window !== "undefined") {
  dbPromise = openDB<MyAppDB>("conversationsDB", 1, {
    upgrade(db) {
      const store = db.createObjectStore("conversations", {
        keyPath: "id", // Use 'id' as the primary key
      });
      store.createIndex("by-prompt", "prompt");
    },
  });
}

// Define the conversationsDB utility with typed methods
export const conversationsDB = {
  async getAllConversations(): Promise<Conversation[]> {
    if (!dbPromise) return [];
    const conversations = await (await dbPromise).getAll("conversations");
    return conversations.sort((a, b) => a.timestamp - b.timestamp);
  },

  async addConversation(conversation: Conversation): Promise<string | null> {
    if (!dbPromise) return null;
    return (await dbPromise).add("conversations", conversation);
  },

  async deleteConversation(id: string): Promise<void> {
    if (!dbPromise) return;
    return (await dbPromise).delete("conversations", id);
  },

  async clearConversations(): Promise<void> {
    if (!dbPromise) return;
    return (await dbPromise).clear("conversations");
  },
};
