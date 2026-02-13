"use client";

// Chat type matching PostgreSQL response
type Chat = {
  _id: string;
  _creationTime: number;
  title: string;
  userId: string;
  createdAt: number;
};
import { NavigationContext } from "@/lib/context/navigation";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "./ui/button";

interface ChatRowProps {
  chat: Chat;
  onDelete: (id: Id<"chats">) => void;
}

export const ChatRow = ({ chat, onDelete }: ChatRowProps) => {
  // Implement Hooks react
  const router = useRouter();
  const { closeMobileNav } = use(NavigationContext);

  const handleClick = () => {
    router.push(`/dashboard/chat/${chat._id}`);
    closeMobileNav();
  };

  return (
    <div
      className="group rounded-xl border border-gray-200/30 bg-white/50 backdrop-blur-xs hover:bg-white/80 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium text-gray-700">{chat.title}</span>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="opacity-0 group-hover:opacity-100 -mr-2 ml-2  transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chat._id);
            }}
          >
            <TrashIcon className="size-4 text-gray-400 hover:text-red-500 transition-colors duration-300" />
          </Button>
        </div>
        {/* Last Message */}

        {/* {lastMessage && <p></p>} */}
      </div>
    </div>
  );
};
