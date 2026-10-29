import {
  BriefcaseIcon,
  CertificateIcon,
  CurrencyDollarIcon,
  FileTextIcon,
  GraduationCapIcon,
  IdentificationCardIcon,
  ListBulletsIcon,
  SignatureIcon,
  SlidersHorizontalIcon,
  SquaresFourIcon,
  TranslateIcon,
  UserIcon,
  UserRectangleIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { FormAccordionSection } from "@/components/commons/form-accordion-section/form-accordion-section";
import { Input } from "@/components/commons/input/input";
import { CvSkillsDisplayField } from "@/components/commons/cv-list-editor/cv-skills-display-field";
import { CvListEditor } from "@/components/commons/cv-list-editor/cv-list-editor";
import { LineItemsEditor } from "@/components/commons/line-items-editor/line-items-editor";
import { isCvListKey } from "@/lib/market-place/cv-lists";
import { computeTotal, sumLineItems } from "@/lib/market-place/line-items";
import type { TemplateField } from "@/types/template";
import { getFormSections } from "@/lib/market-place/form-sections";
import { useState } from "react";
import type { ReactNode } from "react";

const sectionIcons: Record<string, Icon> = {
  details: FileTextIcon,
  from: UserIcon,
  to: IdentificationCardIcon,
  content: ListBulletsIcon,
  payment: CurrencyDollarIcon,
  signatures: SignatureIcon,
  personal: UserRectangleIcon,
  about: UserIcon,
  experience: BriefcaseIcon,
  education: GraduationCapIcon,
  skills: SlidersHorizontalIcon,
  languages: TranslateIcon,
  certificates: CertificateIcon,
  additional: SquaresFourIcon,
};

export type TemplateFormProps = {
  fields: TemplateField[];
  onChange: (key: string, value: string) => void;
  values: Record<string, string>;
  documentNameField?: ReactNode;
  recipientPicker?: ReactNode;
  /** Replaces a field's input, by key — e.g. a read-only status once a recipient has been sent the document. */
  fieldSlots?: Partial<Record<string, ReactNode>>;
};

export const TemplateForm = ({
  fields,
  onChange,
  values,
  documentNameField,
  recipientPicker,
  fieldSlots,
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

  const sections = getFormSections(fields).filter(
    (section) =>
      section.fields.length || (section.id === "details" && documentNameField),
  );
  // Accordion: one section open at a time, starting with the first.
  const [openId, setOpenId] = useState<string | null>(
    () => sections[0]?.id ?? null,
  );
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(),
  );

  // Values are already kept in the draft as they change; this marks the section done and moves on.
  const saveSection = (index: number) => {
    setCompletedIds((previous) => new Set(previous).add(sections[index].id));
    setOpenId(sections[index + 1]?.id ?? null);
  };

  return (
    <div className="template-form grid min-w-0 gap-4">
      {sections.map((section, index) => {
        return (
          <FormAccordionSection
            icon={sectionIcons[section.id] ?? FileTextIcon}
            id={section.id}
            isComplete={completedIds.has(section.id)}
            isLast={index === sections.length - 1}
            isOpen={openId === section.id}
            key={section.id}
            onNext={() => saveSection(index)}
            onToggle={() =>
              setOpenId((current) =>
                current === section.id ? null : section.id,
              )
            }
            title={section.title}
          >
            {section.id === "details" ? documentNameField : null}
            {section.id === "to" ? recipientPicker : null}
            {section.fields.map((field) => {
              const slot = fieldSlots?.[field.key];
              if (slot) {
                return <div key={field.key}>{slot}</div>;
              }
              if (field.key === "skillsDisplay") {
                return (
                  <CvSkillsDisplayField
                    key={field.key}
                    onChange={(value) => change({ [field.key]: value })}
                    value={values[field.key] ?? ""}
                  />
                );
              }
              if (isCvListKey(field.key)) {
                return (
                  <CvListEditor
                    key={field.key}
                    listKey={field.key}
                    onChange={(value) => change({ [field.key]: value })}
                    value={values[field.key] ?? ""}
                  />
                );
              }
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
                const manualKey = isSubtotal ? "subtotalManual" : "totalManual";
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
          </FormAccordionSection>
        );
      })}
    </div>
  );
};

export default TemplateForm;
