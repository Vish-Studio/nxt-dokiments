import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      id,
      label,
      options,
      placeholder = "Select an option",
      ...props
    },
    ref,
  ) => {
    return (
      <label className="form-control w-full">
        {label ? (
          <span className="label pb-2">
            <span className="label-text font-title text-sm font-semibold text-nox-noir">
              {label}
            </span>
          </span>
        ) : null}
        <select
          ref={ref}
          id={id}
          className={cn(
            "select w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors focus:border-bloodwood-deep focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-bloodwood-deep/15",
            className,
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  },
);

Select.displayName = "Select";
