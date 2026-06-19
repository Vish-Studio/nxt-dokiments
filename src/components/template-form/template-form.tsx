import { Input } from "@/components/input/input";
import type { TemplateField } from "@/types/template";

export type TemplateFormProps = {
  fields: TemplateField[];
  onChange: (key: string, value: string) => void;
  values: Record<string, string>;
};

export const TemplateForm = ({ fields, onChange, values }: TemplateFormProps) => {
  return (
    <div className="grid gap-5">
      {fields.map((field) => {
        if (field.type === "textarea") {
          return (
            <label className="form-control w-full" key={field.key}>
              <span className="label pb-2">
                <span className="label-text font-title text-sm font-semibold text-nox-noir">
                  {field.label}
                </span>
              </span>
              <textarea
                className="textarea min-h-28 w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors placeholder:text-nox-noir/40 focus:border-bloodwood-deep focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-bloodwood-deep/15"
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
              />
            </label>
          );
        }

        return (
          <Input
            key={field.key}
            label={field.label}
            onChange={(event) => onChange(field.key, event.target.value)}
            placeholder={field.placeholder}
            type={field.type}
            value={values[field.key] ?? ""}
          />
        );
      })}
    </div>
  );
};
