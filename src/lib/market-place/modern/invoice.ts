import { createTemplate } from "@/lib/market-place/create-template";
import { invoice } from "@/lib/market-place/documents";
import { modern } from "@/lib/market-place/styles";

export const modernInvoice = createTemplate(modern, invoice);
