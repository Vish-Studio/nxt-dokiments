"use client";

import { Check } from "@phosphor-icons/react";

import { Button } from "@/components/button/button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { AppPalette } from "@/stores/ui-store";

type PaletteOption = {
  description: string;
  label: string;
  value: AppPalette;
};

const paletteOptions: PaletteOption[] = [
  {
    description: "Original dark shell with Golden Harvest active states.",
    label: "Classic",
    value: "classic",
  },
  {
    description: "Golden Harvest shell with Bloodwood Deep navigation states.",
    label: "Golden",
    value: "golden",
  },
  {
    description: "Bloodwood Deep shell with softer Golden Harvest controls.",
    label: "Bloodwood",
    value: "bloodwood",
  },
];

export const GeneralSettings = () => {
  const appPalette = useUiStore((state) => state.appPalette);
  const setAppPalette = useUiStore((state) => state.setAppPalette);

  return (
    <section className="w-full p-5 sm:p-6 lg:p-8">
      <div className="max-w-3xl">
        <div className="border-b border-steel-mist pb-5">
          <h3 className="font-title text-xl font-bold text-bloodwood-deep">
            General
          </h3>
          <p className="mt-1 text-sm leading-6 text-nox-noir/65">
            Choose the dashboard color variation for this workspace.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {paletteOptions.map((palette) => {
            const isSelected = palette.value === appPalette;

            return (
              <Button
                aria-pressed={isSelected}
                className={cn(
                  "h-auto min-h-0 flex-col items-start gap-4 rounded-box border bg-base-100 p-4 text-left text-nox-noir shadow-none hover:border-bloodwood-deep hover:bg-base-200",
                  isSelected ? "border-bloodwood-deep" : "border-steel-mist",
                )}
                icon={null}
                key={palette.value}
                onClick={() => setAppPalette(palette.value)}
                variant="ghost"
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="font-title text-sm font-bold">
                    {palette.label}
                  </span>
                  <span className="flex items-center gap-2">
                    {isSelected ? (
                      <Check
                        aria-hidden
                        className="text-bloodwood-deep"
                        size={18}
                        weight="bold"
                      />
                    ) : null}
                    <span
                      className="grid h-8 w-14 grid-cols-2 overflow-hidden rounded-box border border-steel-mist"
                      data-palette={palette.value}
                    >
                      <span className="bg-app-chrome" />
                      <span className="bg-app-active" />
                    </span>
                  </span>
                </span>
                <span className="text-sm leading-5 text-nox-noir/65">
                  {palette.description}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
