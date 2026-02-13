import { redirect } from "next/navigation";

import { ChatInterface } from "@/components/chat-interface";

interface ChatPageParams {
  params: Promise<{ chatId: string }>;
}

async function ChatPage({ params }: ChatPageParams) {
  const { chatId } = await params;
  // Authentication removed - no longer required for research purposes

  try {
    // Fetch messages from PostgreSQL via API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/messages?chatId=${chatId}`, {
      cache: 'no-store', // Ensure fresh data on each request
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const initialMessages = await response.json();

    return (
      <div className="flex-1 overflow-hidden">
        <ChatInterface initialMessages={initialMessages} chatId={chatId} />
      </div>
    );
  } catch (error) {
    console.log(`Error fetching chat: ${error}`);
    redirect("/dashboard");
  }
}

export default ChatPage;
