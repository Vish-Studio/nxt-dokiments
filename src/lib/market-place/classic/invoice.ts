import { createTemplate } from "@/lib/market-place/create-template";
import { invoice } from "@/lib/market-place/documents";
import { classic } from "@/lib/market-place/styles";

export const classicInvoice = createTemplate(classic, invoice);
