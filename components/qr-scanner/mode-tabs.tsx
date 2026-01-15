"use client";

import { cn } from "@/lib/utils";
import type { ScannerMode, ModeConfig } from "@/lib/qr-scanner/data";
import { getModeConfig } from "@/lib/qr-scanner/data";

interface ModeTabsProps {
  mode: ScannerMode;
  onModeChange: (mode: ScannerMode) => void;
}

interface TabConfig {
  mode: ScannerMode;
  label: string;
  disabled: boolean;
}

const tabs: TabConfig[] = [
  { mode: "checkin", label: "Check-in", disabled: false },
  { mode: "workshop", label: "Workshops", disabled: true },
  { mode: "food", label: "Food", disabled: true },
];

export function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex border-b bg-white">
      {tabs.map((tab) => {
        const config = getModeConfig(tab.mode);
        const isActive = mode === tab.mode;

        return (
          <button
            key={tab.mode}
            type="button"
            onClick={() => onModeChange(tab.mode)}
            disabled={tab.disabled}
            className={cn(
              "flex-1 py-3 px-4 text-center font-medium transition-colors",
              tab.disabled && "opacity-50 cursor-not-allowed",
              isActive
                ? `border-b-2 ${config.borderColor} ${config.textColor} ${config.lightBg}`
                : tab.disabled
                  ? "text-gray-400"
                  : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
