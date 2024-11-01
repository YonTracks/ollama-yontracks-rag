// hooks/useConversationsDB.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { conversationsDB } from "@/lib/utils/conversationsDB";
import { Conversation } from "@/types/conversations";

/**
 * A custom hook that provides interaction with the conversations database.
 *
 * @returns An object containing:
 * - `conversations`: The list of currently loaded conversations.
 * - `addConversation`: A function to add a new conversation.
 * - `deleteConversation`: A function to delete a conversation by its ID.
 * - `clearConversations`: A function to clear all conversations.
 */
function useConversationsDB() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Load conversations on component mount
  useEffect(() => {
    /**
     * Loads all saved conversations from the database and sets them in state.
     */
    const loadConversations = async () => {
      try {
        const savedConversations = await conversationsDB.getAllConversations();
        setConversations(savedConversations);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };
    loadConversations();
  }, []);

  /**
   * Adds a new conversation to the database and updates the local state.
   *
   * @param conversation The conversation object to add.
   */
  const addConversation = useCallback(async (conversation: Conversation) => {
    try {
      const id = await conversationsDB.addConversation(conversation);
      if (id) {
        setConversations((prev) => [
          ...prev,
          { ...conversation, id }, // 'id' is added to the conversation object
        ]);
      }
    } catch (error) {
      console.error("Failed to add conversation:", error);
    }
  }, []);

  /**
   * Deletes a conversation from the database and removes it from local state.
   *
   * @param id The ID of the conversation to delete.
   */
  const deleteConversation = useCallback(async (id: string) => {
    try {
      await conversationsDB.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }, []);

  /**
   * Clears all conversations from both the database and local state.
   */
  const clearConversations = useCallback(async () => {
    try {
      await conversationsDB.clearConversations();
      setConversations([]);
    } catch (error) {
      console.error("Failed to clear conversations:", error);
    }
  }, []);

  return {
    conversations,
    addConversation,
    deleteConversation,
    clearConversations,
  };
}

export default useConversationsDB;
