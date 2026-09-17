import { cn } from "@/lib/utils";
import type { TemplateField } from "@/types/template";
import { withPartyContacts } from "@/lib/market-place/party-fields";

export const partyFieldKeys = new Set([
  "fromName", "fromPhone", "fromEmail", "fromAddress", "toName", "toAddress", "toEmail", "toPhone", "toBrn",
  "partyOne", "partyOneAddress", "partyTwo", "partyTwoAddress",
]);

interface Props {
  fields: TemplateField[];
  values: Record<string, string>;
  compact: boolean;
  labelClassName: string;
}

export const TemplateParties = ({ fields, values, compact, labelClassName }: Props) => {
  const contactFields = withPartyContacts(fields);
  const parties = [
    { label: "From", keys: ["fromName", "fromPhone", "fromEmail", "fromAddress"] },
    { label: "To", keys: ["toName", "toPhone", "toEmail", "toAddress", "toBrn"] },
    { label: "Disclosing party", keys: ["partyOne", "partyOneAddress"] },
    { label: "Receiving party", keys: ["partyTwo", "partyTwoAddress"] },
  ].filter((party) => fields.some((field) => party.keys.includes(field.key)));

  if (!parties.length) return null;

  return (
    <dl className="template-parties mb-8 grid grid-cols-2 gap-6 break-words [overflow-wrap:anywhere]">
      {parties.map((party) => (
        <div className="min-w-0" key={party.label}>
          <dt className={labelClassName}>{party.label}</dt>
          <dd className={cn("mt-2 space-y-1 whitespace-pre-line", compact ? "text-xs" : "text-sm")}>
            {party.keys.map((key, index) => {
              const field = contactFields.find((candidate) => candidate.key === key);
              if (!field) return null;
              const value = values[key]?.trim();
              // Optional contact details must not look like real sample data when empty.
              if (key !== party.keys[0] && !key.endsWith("Address") && !value) return null;
              return (
                <p className={cn(index === 0 ? "font-semibold" : "text-nox-noir/70", !value && "italic text-nox-noir/35")} key={key}>
                  {key === "toBrn" ? "BRN: " : ""}{value || field.placeholder || "—"}
                </p>
              );
            })}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default TemplateParties;
