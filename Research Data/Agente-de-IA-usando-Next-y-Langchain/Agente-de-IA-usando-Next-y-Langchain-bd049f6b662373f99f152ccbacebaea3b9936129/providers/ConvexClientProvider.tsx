"use client";

// Convex replaced with PostgreSQL - this provider is no longer needed
// Kept for compatibility but just passes through children
export const ConvexClientProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <>{children}</>;
};
