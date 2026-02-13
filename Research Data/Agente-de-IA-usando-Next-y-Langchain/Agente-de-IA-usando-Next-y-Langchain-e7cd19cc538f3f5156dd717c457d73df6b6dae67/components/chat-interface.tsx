"use client";
import { ChatRequestBody } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

// Message type matching PostgreSQL response
type Message = {
  _id: string;
  _creationTime: number;
  chatId: string;
  content: string;
  role: "user" | "assistant";
  createdAt: number;
};

interface ChatInterfaceProps {
  chatId: string;
  initialMessages: Message[];
}

export const ChatInterface = ({ chatId, initialMessages }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streamedResponse, setStreamedResponse] = useState<string>("");
  const [currentTool, setCurrentTool] = useState<{ name: string; input: unknown } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Reset UI State for new message
    setInput("");
    setStreamedResponse("");
    setCurrentTool(null);
    setIsLoading(true);

    //* Add users message immediately for better UX
    const optimisticUserMessage: Message = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now(),
      _creationTime: Date.now(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);

    //* Track complete response for saving database
    const fullResponse = "";

    //* Start Streaming Response
    try {
      const requestBody: ChatRequestBody = {
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        newMessage: trimmedInput,
        chatId,
      };

      //* Initialize SSE Connection
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error(await response.text());
      if (!response.ok) throw new Error("No response body available");

      //* Handle the stream

    } catch (error) {
      console.error("Error streaming response:", error);
      //* Remove optimistic message
      setMessages((prev) => prev.filter((message) => message._id !== optimisticUserMessage._id));
      setStreamedResponse("Error streaming response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <main className="flex flex-col h-[calc(100vh-(--spacing(14)))]">
        {/* Messages */}
        <section className="bg-red-50 flex-1">
          <div>
            {/* Previous Messages */}
            {messages.map((message) => (
              <div key={message._id}>{message.content}</div>
            ))}

            {/* Last Message */}
            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* footer */}
        <footer className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Ai Agent..."
                className="flex-1 py-3 rounded-2xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm pl-2 pr-12 bg-gray-50 placeholder:text-gray-500"
              />
              <Button
                className={cn(
                  "absolute right-1.5 rounded-xl size-9 p-0 flex items-center justify-center transition-all",
                  input.trim() ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs" : "bg-gray-100 text-gray-400"
                )}
                type="submit"
                disabled={isLoading || !input.trim()}
              >
                <ArrowRight />
              </Button>
            </div>
          </form>
        </footer>
      </main>
    </div>
  );
};
