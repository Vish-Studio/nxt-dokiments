import { computeTotal, sumLineItems } from "@/lib/market-place/line-items";

/** Money fields in priority order: the final figure first. */
const amountKeys = [
  "total",
  "amountPaid",
  "projectFee",
  "fee",
  "price",
  "additionalFee",
] as const;

const numberFormatter = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/**
 * The headline amount of a document, for lists: the first filled money field
 * (total, amount paid, fee, price…), else the total worked out from line items
 * and tax. Plain numbers get thousands separators ("1,250.00"); anything typed
 * with a currency ("Rs 10,000", "$500") is shown as typed. Empty when the
 * document has no amount.
 */
export const getDocumentAmount = (values: Record<string, string> = {}) => {
  const typed = amountKeys
    .map((key) => values[key]?.trim() ?? "")
    // Placeholder-like zeros ("$0.00") don't count as an amount.
    .find((value) => /[1-9]/.test(value));
  const fromItems = computeTotal(
    values.subtotal?.trim() || sumLineItems(values.items ?? ""),
    values.tax ?? "",
  );
  const amount = typed ?? (Number(fromItems) ? fromItems : "");

  if (!amount) return "";
  return /^-?\d+(\.\d+)?$/.test(amount)
    ? numberFormatter.format(Number(amount))
    : amount;
};
