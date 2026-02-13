"use client";

import { Button } from "@/components/ui/button";
import { NavigationContext } from "@/lib/context/navigation";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ChatRow } from "./chatrow";

// Chat type matching PostgreSQL response
type Chat = {
  _id: string;
  _creationTime: number;
  title: string;
  userId: string;
  createdAt: number;
};

const Sidebar = () => {
  const router = useRouter();
  const { closeMobileNav, isMobileNavOpen } = use(NavigationContext);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch chats from API
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats');
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        router.push(`/dashboard/chat/${newChat._id}`);
        closeMobileNav();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const response = await fetch(`/api/chats?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setChats(prev => prev.filter(chat => chat._id !== id));
        // If we're currently viewing this chat, redirect to dashboard
        if (window.location.pathname.includes(id)) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <>
      {/* Background Overlay for Mobile Nav */}
      {isMobileNavOpen && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" onClick={closeMobileNav} />}
      <div
        className={cn(
          "fixed md:inset-y-0 top-14 bottom-0 left-0 z-50 w-72 bg-gray-50/80 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-0 flex flex-col",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-gray-200/50">
          <Button
            onClick={handleNewChat}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/50 shadow-xs hover:shadow-sm transition-all duration-200"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2.5 p-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {chats?.map((chat) => <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} />)}
        </div>
      </div>
    </>
  );
};
export default Sidebar;
