import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type RangeSliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> & {
  label: string;
  onChange: (value: number) => void;
  value: number;
};

export const RangeSlider = ({
  className,
  label,
  onChange,
  value,
  ...props
}: RangeSliderProps) => (
  <label className={cn("range-slider grid w-full gap-2", className)}>
    <span className="flex items-center justify-between gap-3">
      <span className="font-title text-sm font-semibold text-nox-noir">
        {label}
      </span>
      <span className="font-title text-sm font-semibold tabular-nums text-nox-noir/60">
        {value}%
      </span>
    </span>
    <input
      className="range range-xs w-full text-nox-noir"
      max={100}
      min={0}
      onChange={(event) => onChange(Number(event.target.value))}
      step={5}
      type="range"
      value={value}
      {...props}
    />
  </label>
);

export default RangeSlider;
