import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, within } from "storybook/test";

import { RangeSlider } from "../range-slider";

const meta = {
  title: "Commons/Range Slider",
  component: RangeSlider,
  args: { label: "Level", onChange: fn(), value: 70 },
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("70%")).toBeVisible();
    const slider = canvas.getByRole("slider");
    await fireEvent.change(slider, { target: { value: "75" } });
    await expect(args.onChange).toHaveBeenCalledWith(75);
  },
};

export const Full: Story = { args: { value: 100 } };
