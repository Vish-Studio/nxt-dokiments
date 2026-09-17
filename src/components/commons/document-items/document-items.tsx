import { itemAmount, readLineItems } from "@/lib/market-place/line-items";

interface Props { value: string }
export const DocumentItems = ({ value }: Props) => {
  const rows = readLineItems(value);
  return (
    <section className="document-items mt-6 text-xs sm:text-sm">
      {rows ? (
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="mb-3 text-left font-title font-bold">Items</caption>
          <thead><tr className="border-b border-steel-mist"><th className="w-1/2 py-2">Description</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Unit price</th><th className="py-2 text-right">Amount</th></tr></thead>
          <tbody>{rows.map((row, index) => <tr className="border-b border-steel-mist align-top" key={index}><td className="whitespace-pre-line break-words py-3 pr-3">{row.description || "—"}</td><td className="break-words py-3 text-right">{row.quantity || "—"}</td><td className="break-words py-3 text-right">{row.price || "—"}</td><td className="break-words py-3 text-right">{itemAmount(row)}</td></tr>)}</tbody>
        </table>
      ) : <div><h3 className="mb-3 font-title font-bold">Items</h3><ul className="space-y-2">{value.split("\n").map((line, i) => <li className="whitespace-pre-line break-words border-b border-steel-mist py-2" key={i}>{line}</li>)}</ul></div>}
    </section>
  );
};
export default DocumentItems;
