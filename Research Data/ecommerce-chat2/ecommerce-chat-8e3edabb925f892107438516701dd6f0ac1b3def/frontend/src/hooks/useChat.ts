import { useState, useCallback } from "react";
import { chatService } from "@/services/chat";
import type { ChatMessage, ChatResponse } from "@/services/chat";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response: ChatResponse = await chatService.sendMessage(
          message,
          conversationId || undefined
        );

        if (response.conversation_id && !conversationId) {
          setConversationId(response.conversation_id);
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: response.message,
          sender: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError("Erro ao enviar mensagem. Tente novamente.");
        console.error("Chat error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  const loadConversationHistory = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const history = await chatService.getConversationHistory(id);
      setMessages(history);
      setConversationId(id);
    } catch (err) {
      setError("Erro ao carregar histórico da conversa.");
      console.error("Load history error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearChat,
    loadConversationHistory,
  };
};
