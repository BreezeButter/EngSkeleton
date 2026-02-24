"use client";

/**
 * Providers.tsx
 *
 * Wraps the application with the HeroUI (NextUI v2) provider so that all
 * HeroUI components have access to theme context.
 */

import React from "react";
import { HeroUIProvider } from "@heroui/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
