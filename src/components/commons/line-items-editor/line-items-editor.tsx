import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { readLineItems, writeLineItems, type LineItem } from "@/lib/market-place/line-items";

interface Props { value: string; onChange: (value: string) => void }
export const LineItemsEditor = ({ value, onChange }: Props) => {
  const structured = readLineItems(value);
  // Legacy text remains intact as a description; converting never guesses prices.
  const rows = structured ?? (value ? [{ description: value, quantity: "", price: "" }] : []);
  const update = (index: number, key: keyof LineItem, text: string) => onChange(writeLineItems(rows.map((row, i) => i === index ? { ...row, [key]: text } : row)));
  return (
    <section className="line-items-editor grid gap-4" aria-label="Line items">
      <h3 className="font-title text-sm font-semibold">Line items</h3>
      {rows.map((row, index) => (
        <div className="grid gap-3 rounded-field border border-steel-mist p-4" key={index}>
          <Input label={`Item ${index + 1} description`} value={row.description} onChange={(event) => update(index, "description", event.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Item ${index + 1} quantity`} type="number" min="0" step="any" value={row.quantity} onChange={(event) => update(index, "quantity", event.target.value)} />
            <Input label={`Item ${index + 1} unit price`} type="number" min="0" step="0.01" value={row.price} onChange={(event) => update(index, "price", event.target.value)} />
          </div>
          <Button size="sm" variant="ghost" onClick={() => onChange(writeLineItems(rows.filter((_, i) => i !== index)))}>Remove item {index + 1}</Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange(writeLineItems([...rows, { description: "", quantity: "1", price: "" }]))}>Add item</Button>
      <p className="text-xs text-nox-noir/60">Unit prices use your document’s currency. Review subtotal, tax, and total below.</p>
    </section>
  );
};
export default LineItemsEditor;
