export interface LineItem { description: string; quantity: string; price: string }
const prefix = "dokiments-items-v1:";
export const readLineItems = (value: string): LineItem[] | null => {
  if (!value.startsWith(prefix)) return null;
  try {
    const rows: unknown = JSON.parse(value.slice(prefix.length));
    return Array.isArray(rows) && rows.every((row) => row && typeof row.description === "string" && typeof row.quantity === "string" && typeof row.price === "string") ? rows : null;
  } catch { return null; }
};
export const writeLineItems = (rows: LineItem[]) => prefix + JSON.stringify(rows);
export const itemAmount = ({ quantity, price }: LineItem) => {
  if (!quantity.trim() || !price.trim()) return "—";
  const amount = Number(quantity) * Number(price);
  return Number.isFinite(amount) ? amount.toFixed(2) : "—";
};
