import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, label, type = "text", ...props }, ref) => {
    return (
      <label className="form-control w-full">
        {label ? (
          <span className="label pb-2">
            <span className="label-text font-title text-sm font-semibold text-nox-noir">
              {label}
            </span>
          </span>
        ) : null}
        <input
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={cn(
            "input w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors placeholder:text-nox-noir/40 focus:border-bloodwood-deep focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-bloodwood-deep/15",
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : null,
            className,
          )}
          id={id}
          type={type}
          {...props}
        />
        {error ? (
          <span className="label pt-2">
            <span className="label-text-alt text-error" id={id ? `${id}-error` : undefined}>
              {error}
            </span>
          </span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = "Input";
