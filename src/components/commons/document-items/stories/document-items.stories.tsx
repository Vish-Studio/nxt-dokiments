import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { writeLineItems } from "@/lib/market-place/line-items";
import { DocumentItems } from "../document-items";
const meta = { title: "Commons/Document Items", component: DocumentItems, args: { value: writeLineItems([{ description: "Design", quantity: "2", price: "125" }]) } } satisfies Meta<typeof DocumentItems>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PricedItems: Story = { play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText("250.00")).toBeVisible(); } };
