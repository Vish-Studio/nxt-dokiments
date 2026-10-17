import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { LineItemHeader } from "@/components/commons/line-item-header/line-item-header";
import { LineItemSummary } from "@/components/commons/line-item-summary/line-item-summary";
import { readLineItems, writeLineItems, type LineItem } from "@/lib/market-place/line-items";

interface Props { value: string; onChange: (value: string) => void }
export const LineItemsEditor = ({ value, onChange }: Props) => {
  const structured = readLineItems(value);
  // Legacy text remains intact as a description; converting never guesses prices.
  const rows = structured ?? (value ? [{ description: value, quantity: "", price: "" }] : []);
  // With several items, only the one being edited shows its inputs; the rest are read-only summaries.
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const isEditing = (index: number) => rows.length === 1 || editingIndex === index;
  const update = (index: number, key: keyof LineItem, text: string) => onChange(writeLineItems(rows.map((row, i) => i === index ? { ...row, [key]: text } : row)));
  // Swaps a row with its neighbour one step up (-1) or down (+1); the open editor follows the row.
  const move = (index: number, step: -1 | 1) => {
    const next = [...rows];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(writeLineItems(next));
    setEditingIndex(index + step);
  };
  const remove = (index: number) => {
    onChange(writeLineItems(rows.filter((_, i) => i !== index)));
    setEditingIndex(null);
  };
  const add = () => {
    onChange(writeLineItems([...rows, { description: "", quantity: "1", price: "" }]));
    setEditingIndex(rows.length);
  };
  return (
    <section className="line-items-editor grid min-w-0 gap-4" aria-label="Line items">
      <h3 className="font-title text-sm font-semibold">Line items</h3>
      {rows.map((row, index) => isEditing(index) ? (
        <div aria-label={`Item ${index + 1}`} className="grid min-w-0 gap-3 rounded-field border border-steel-mist p-4" key={index} role="group">
          <LineItemHeader index={index} isFirst={index === 0} isLast={index === rows.length - 1} onDone={rows.length > 1 ? () => setEditingIndex(null) : undefined} onMoveDown={() => move(index, 1)} onMoveUp={() => move(index, -1)} onRemove={() => remove(index)} />
          <Input label="Description" value={row.description} onChange={(event) => update(index, "description", event.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" type="number" min="0" step="any" value={row.quantity} onChange={(event) => update(index, "quantity", event.target.value)} />
            <Input label="Unit price" type="number" min="0" step="0.01" value={row.price} onChange={(event) => update(index, "price", event.target.value)} />
          </div>
        </div>
      ) : (
        <LineItemSummary index={index} isFirst={index === 0} isLast={index === rows.length - 1} item={row} key={index} onEdit={() => setEditingIndex(index)} onMoveDown={() => move(index, 1)} onMoveUp={() => move(index, -1)} onRemove={() => remove(index)} />
      ))}
      <Button icon={<PlusIcon aria-hidden size={16} weight="bold" />} iconPosition="left" size="sm" variant="primary" onClick={add}>Add item</Button>
      <p className="text-xs text-nox-noir/60">Unit prices use your document’s currency. Review subtotal, tax, and total below.</p>
    </section>
  );
};
export default LineItemsEditor;
