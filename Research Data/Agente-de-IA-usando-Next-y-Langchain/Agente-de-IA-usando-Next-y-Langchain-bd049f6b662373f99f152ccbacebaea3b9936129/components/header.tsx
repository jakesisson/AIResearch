"use client";

import { Button } from "@/components/ui/button";
import { NavigationContext } from "@/lib/context/navigation";
import { MenuIcon } from "lucide-react";
import { use } from "react";

export default function Header() {
  // use a Use Api to get the context
  const { setIsMobileNavOpen } = use(NavigationContext);

  return (
    <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Chat with an AI Agent
          </div>
        </div>
        {/* User button removed - authentication no longer required */}
      </div>
    </header>
  );
}
