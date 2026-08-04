import { createTemplate } from "@/lib/market-place/create-template";
import { invoice } from "@/lib/market-place/documents";
import { minimal } from "@/lib/market-place/styles";

export const minimalInvoice = createTemplate(minimal, invoice);
