export interface LineItem {
  description: string;
  quantity: string;
  price: string;
}
const prefix = "dokiments-items-v1:";
export const readLineItems = (value: string): LineItem[] | null => {
  if (!value.startsWith(prefix)) return null;
  try {
    const rows: unknown = JSON.parse(value.slice(prefix.length));
    return Array.isArray(rows) &&
      rows.every(
        (row) =>
          row &&
          typeof row.description === "string" &&
          typeof row.quantity === "string" &&
          typeof row.price === "string",
      )
      ? rows
      : null;
  } catch {
    return null;
  }
};

export const writeLineItems = (rows: LineItem[]) =>
  prefix + JSON.stringify(rows);

export const itemAmount = ({ quantity, price }: LineItem) => {
  if (!quantity.trim() || !price.trim()) return "—";
  const amount = Number(quantity) * Number(price);
  return Number.isFinite(amount) ? amount.toFixed(2) : "—";
};

export const sumLineItems = (value: string) => {
  const rows = readLineItems(value);
  if (!rows) return "";
  const amounts = rows
    .map(itemAmount)
    .filter((amount) => amount !== "—")
    .map(Number);
  return amounts.length
    ? amounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)
    : "";
};

const toNumber = (text: string) => {
  const number = Number(text.replace(/[^0-9.\-]/g, ""));
  return text.trim() && Number.isFinite(number) ? number : 0;
};

// A tax ending in "%" is a percentage of the subtotal; anything else is a flat amount.
export const computeTotal = (subtotal: string, tax: string) => {
  if (!subtotal.trim() && !tax.trim()) return "";
  const base = toNumber(subtotal);
  const taxAmount = tax.trim().endsWith("%")
    ? (base * toNumber(tax)) / 100
    : toNumber(tax);
  return (base + taxAmount).toFixed(2);
};
