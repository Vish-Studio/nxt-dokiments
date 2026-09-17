import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, waitFor } from "storybook/test";

import { SignInForm } from "../sign-in-form";

const meta = {
  title: "Commons/Sign In Form",
  component: SignInForm,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /sign in/i }),
    ).toBeVisible();
  },
};

/** How sign-in looks after a session hits its 1-day cap and the user is bounced
 * back here with `?expired=1`. The `notice` prop is passed directly so the story
 * doesn't depend on the URL. */
export const SessionExpired: Story = {
  args: {
    notice: "Your session expired after 24 hours. Please sign in again.",
    onSubmit: async () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent(
      /session expired after 24 hours/i,
    );
  },
};

export const Validation: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
    await expect(await canvas.findByText("Email is required.")).toBeVisible();
    await expect(
      await canvas.findByText("Password is required."),
    ).toBeVisible();
    // The promo field is optional, so an empty one must never block sign-in.
    await expect(canvas.queryByText(/promo code is required/i)).toBeNull();
  },
};

/**
 * Signing in with credentials that arrived by AutoFill rather than by typing.
 *
 * iOS AutoFill — and the password managers that plug into the iOS keyboard — set
 * `input.value` on the fields the user is not focused on without firing an event
 * React can see, which is reproduced here with the native value setter. Sign-in
 * has to go through anyway: before `syncAutofilledFields`, `react-hook-form` still
 * held its empty defaults and rejected the visibly filled fields as required.
 */
export const AutofilledCredentials: Story = {
  args: {
    onSubmit: fn(async () => undefined),
  },
  play: async ({ args, canvas, userEvent }) => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    if (!setValue) throw new Error("No native value setter to autofill with.");

    setValue.call(
      canvas.getByPlaceholderText("you@company.com"),
      "autofill@example.com",
    );
    setValue.call(
      canvas.getByPlaceholderText("Enter your password"),
      "autofilled-secret",
    );

    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));

    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: "autofill@example.com",
      password: "autofilled-secret",
      promoCode: "",
    });
    await expect(canvas.queryByText("Email is required.")).toBeNull();
  },
};

/**
 * Choosing a saved login signs in on its own, with no tap on the button.
 *
 * The tap on the email field stands in for the gesture that brings up the
 * keyboard, then both fields are filled the way a manager fills them — values
 * written straight to the DOM, including to the field that is not focused.
 * `useAutofillSubmit` reads that unfocused write as a fill and submits.
 */
export const AutofilledCredentialsSubmitOnTheirOwn: Story = {
  args: {
    onSubmit: fn(async () => undefined),
  },
  play: async ({ args, canvas, userEvent }) => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    if (!setValue) throw new Error("No native value setter to autofill with.");

    const email = canvas.getByPlaceholderText("you@company.com");
    await userEvent.click(email);

    setValue.call(email, "autofill@example.com");
    setValue.call(
      canvas.getByPlaceholderText("Enter your password"),
      "autofilled-secret",
    );

    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({
        email: "autofill@example.com",
        password: "autofilled-secret",
        promoCode: "",
      }),
    );
    // Arms once, so the fill cannot be sent twice.
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

/**
 * The same fill, from a provider that *does* dispatch an input event for every
 * field it writes.
 *
 * Worth its own story because it is the easy thing to break: anything that
 * baselines field values on a bare input event hides this fill completely, and
 * auto-submit then silently never fires. Only an input event on the field the
 * user is actually focused on may be treated as a hand edit.
 */
export const AutofilledCredentialsThatDispatchInputEvents: Story = {
  args: {
    onSubmit: fn(async () => undefined),
  },
  play: async ({ args, canvas, userEvent }) => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    if (!setValue) throw new Error("No native value setter to autofill with.");

    const email = canvas.getByPlaceholderText("you@company.com");
    const password = canvas.getByPlaceholderText("Enter your password");
    await userEvent.click(email);

    for (const [input, value] of [
      [email, "autofill@example.com"],
      [password, "autofilled-secret"],
    ] as const) {
      setValue.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({
        email: "autofill@example.com",
        password: "autofilled-secret",
        promoCode: "",
      }),
    );
  },
};

/**
 * Typing must never trip the auto-submit: the user has to be able to finish the
 * password, and reach the promo field below it, at their own pace.
 *
 * The tab off the email field at the end is the case that makes this subtle. By
 * the time the fields are next sampled the email is no longer focused, so an
 * edit has to be recognised as the user's when it happens rather than when it is
 * noticed — otherwise simply moving on looks exactly like a fill.
 */
export const TypedCredentialsWaitForTheButton: Story = {
  args: {
    onSubmit: fn(async () => undefined),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("Enter your password"),
      "typed-secret",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("you@company.com"),
      "typed@example.com",
    );
    await userEvent.tab();

    // Comfortably longer than the fill sampling interval.
    await new Promise((resolve) => setTimeout(resolve, 800));
    await expect(args.onSubmit).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

/** The launch offer is advertised alongside the credentials, with an optional field for it. */
export const WithPromoCallout: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Launch Promo")).toBeVisible();
    await expect(canvas.getByText("ViSHDOK2026!")).toBeVisible();
    await expect(
      canvas.getByLabelText(/promo code \(optional\)/i),
    ).toBeVisible();
  },
};
