import {
  CurrencyDollarIcon,
  FileTextIcon,
  IdentificationCardIcon,
  ListBulletsIcon,
  SignatureIcon,
  UserIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Input } from "@/components/commons/input/input";
import { LineItemsEditor } from "@/components/commons/line-items-editor/line-items-editor";
import { computeTotal, sumLineItems } from "@/lib/market-place/line-items";
import type { TemplateField } from "@/types/template";
import { getFormSections } from "@/lib/market-place/form-sections";
import type { ReactNode } from "react";

const sectionIcons: Record<string, Icon> = {
  details: FileTextIcon,
  from: UserIcon,
  to: IdentificationCardIcon,
  content: ListBulletsIcon,
  payment: CurrencyDollarIcon,
  signatures: SignatureIcon,
};

export type TemplateFormProps = {
  fields: TemplateField[];
  onChange: (key: string, value: string) => void;
  values: Record<string, string>;
  documentNameField?: ReactNode;
  recipientPicker?: ReactNode;
};

export const TemplateForm = ({
  fields,
  onChange,
  values,
  documentNameField,
  recipientPicker,
}: TemplateFormProps) => {
  const isBilling =
    fields.some((entry) => entry.key === "subtotal") &&
    fields.some((entry) =>
      ["invoiceNumber", "quoteNumber"].includes(entry.key),
    );

  // Applies the updates, then refreshes the calculated subtotal/total unless the user overrode them.
  const change = (updates: Record<string, string>) => {
    const next = { ...values, ...updates };
    if (isBilling) {
      if (next.subtotalManual !== "true")
        updates.subtotal = next.subtotal = sumLineItems(next.items ?? "");
      if (next.totalManual !== "true")
        updates.total = computeTotal(next.subtotal ?? "", next.tax ?? "");
    }
    Object.entries(updates).forEach(([key, value]) => onChange(key, value));
  };

  return (
    <div className="template-form grid min-w-0 gap-8">
      {getFormSections(fields)
        .filter(
          (section) =>
            section.fields.length ||
            (section.id === "details" && documentNameField),
        )
        .map((section) => {
          const SectionIcon = sectionIcons[section.id] ?? FileTextIcon;
          return (
            <fieldset
              className="min-w-0 border-0 border-t border-steel-mist/60 pt-6 first:border-t-0 first:pt-0"
              key={section.id}
            >
              <legend className="float-left mb-5 flex w-full items-center gap-2 font-title text-base font-bold text-nox-noir">
                <SectionIcon
                  aria-hidden
                  className="size-5 shrink-0"
                />
                {section.title}
              </legend>
              <div className="clear-both grid min-w-0 gap-4">
                {section.id === "details" ? documentNameField : null}
                {section.id === "to" ? recipientPicker : null}
                {section.fields.map((field) => {
                  if (isBilling && field.key === "items") {
                    return (
                      <LineItemsEditor
                        key={field.key}
                        value={values.items ?? ""}
                        onChange={(value) => change({ items: value })}
                      />
                    );
                  }
                  if (
                    isBilling &&
                    (field.key === "subtotal" || field.key === "total")
                  ) {
                    const isSubtotal = field.key === "subtotal";
                    const manualKey = isSubtotal
                      ? "subtotalManual"
                      : "totalManual";
                    const isManual = values[manualKey] === "true";
                    return (
                      <div
                        className="grid gap-2"
                        key={field.key}
                      >
                        <Input
                          label={field.label}
                          onChange={(event) =>
                            change({
                              [manualKey]: "true",
                              [field.key]: event.target.value,
                            })
                          }
                          placeholder={field.placeholder}
                          value={values[field.key] ?? ""}
                        />
                        <p className="text-xs text-nox-noir/60">
                          {isManual
                            ? "Manually overridden."
                            : isSubtotal
                              ? "Calculated from line items."
                              : "Calculated from subtotal and tax."}{" "}
                          {isManual ? (
                            <button
                              className="font-semibold underline"
                              onClick={() => change({ [manualKey]: "" })}
                              type="button"
                            >
                              Reset to calculated
                            </button>
                          ) : (
                            "Edit the field to override."
                          )}
                        </p>
                      </div>
                    );
                  }
                  if (field.type === "textarea") {
                    return (
                      <label
                        className="form-control w-full"
                        key={field.key}
                      >
                        <span className="label pb-2">
                          <span className="label-text font-title text-sm font-semibold text-nox-noir">
                            {field.label}
                          </span>
                        </span>
                        <textarea
                          className="textarea min-h-28 w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors placeholder:text-nox-noir/40 focus:border-nox-noir focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-nox-noir/15"
                          onChange={(event) =>
                            change({ [field.key]: event.target.value })
                          }
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
                      onChange={(event) =>
                        change({ [field.key]: event.target.value })
                      }
                      placeholder={field.placeholder}
                      type={field.type}
                      value={values[field.key] ?? ""}
                    />
                  );
                })}
              </div>
            </fieldset>
          );
        })}
    </div>
  );
};

export default TemplateForm;
