import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  helperText?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, helperText, label, ...props }, ref) => {
    return (
      <label className="label flex cursor-pointer items-start justify-start gap-3 rounded-box border border-steel-mist bg-base-100 p-4">
        <input
          ref={ref}
          type="checkbox"
          suppressHydrationWarning
          className={cn("checkbox checkbox-primary mt-1", className)}
          {...props}
        />
        <span className="grid gap-1 text-left">
          <span className="label-text font-title text-sm font-semibold text-nox-noir">
            {label}
          </span>
          {helperText ? (
            <span className="text-sm leading-6 text-nox-noir/65">{helperText}</span>
          ) : null}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
