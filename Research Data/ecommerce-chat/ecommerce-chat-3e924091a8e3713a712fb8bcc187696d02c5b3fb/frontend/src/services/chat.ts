import api from "./api";

export interface ChatMessage {
  id: string;
  message: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  conversation_id?: string;
}

export const chatService = {
  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    const response = await api.post("/chat", {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  },

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/history/${conversationId}`);
    return response.data;
  },

  async healthCheck(): Promise<{ status: string }> {
    const response = await api.get("/health");
    return response.data;
  },
};

export default chatService;
