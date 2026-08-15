"use client";

import type { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return <div className="relative">{children}</div>;
}
