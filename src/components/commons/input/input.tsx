"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import type { InputHTMLAttributes } from "react";
import { forwardRef, useState } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, label, type = "text", ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === "password";
    const resolvedType = isPasswordField && isPasswordVisible ? "text" : type;

    return (
      <label className="form-control w-full">
        {label ? (
          <span className="label pb-2">
            <span className="label-text font-title text-sm font-semibold text-nox-noir">
              {label}
            </span>
          </span>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error && id ? `${id}-error` : undefined}
            className={cn(
              "input w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors placeholder:text-nox-noir/40 focus:border-nox-noir focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-nox-noir/15",
              isPasswordField ? "pr-11" : null,
              error
                ? "border-error focus:border-error focus:ring-error/20"
                : null,
              className,
            )}
            id={id}
            type={resolvedType}
            {...props}
          />
          {isPasswordField ? (
            <ButtonIcon
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-1 my-auto border-0 bg-transparent text-nox-noir/50 hover:bg-transparent hover:text-nox-noir"
              icon={
                isPasswordVisible ? (
                  <EyeSlashIcon
                    aria-hidden
                    size={18}
                    weight="bold"
                  />
                ) : (
                  <EyeIcon
                    aria-hidden
                    size={18}
                    weight="bold"
                  />
                )
              }
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              size="sm"
              variant="ghost"
            />
          ) : null}
        </div>
        {error ? (
          <span className="label pt-2">
            <span
              className="label-text-alt text-error"
              id={id ? `${id}-error` : undefined}
            >
              {error}
            </span>
          </span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = "Input";
