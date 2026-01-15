"use client";

import { cn } from "@/lib/utils";
import type { ModeConfig } from "@/lib/qr-scanner/data";

interface ScannerHeaderProps {
  modeConfig: ModeConfig;
}

export function ScannerHeader({ modeConfig }: ScannerHeaderProps) {
  return (
    <header className={cn("p-4 text-white text-center", modeConfig.bgColor)}>
      <h1 className="text-xl font-bold">{modeConfig.label}</h1>
    </header>
  );
}
