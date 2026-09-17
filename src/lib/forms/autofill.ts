import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";

/**
 * Copies values the browser autofilled directly into the DOM back into
 * `react-hook-form`'s own state.
 *
 * `register()` leaves inputs uncontrolled and mirrors them into form state from
 * the change events React reports, so that state is only ever as good as the
 * events it was told about. iOS AutoFill — and the password managers that plug
 * into the iOS keyboard — set `input.value` on the fields the user is *not*
 * focused on without an event React can see. The credentials are then visibly
 * sitting in the boxes while form state still holds the empty defaults, so
 * `handleSubmit` fails its own `required` rules and nothing is ever sent: the
 * user taps the keyboard's confirm key and appears to be told the fields they
 * just filled are empty.
 *
 * Call this from the form's `onSubmit` *before* `handleSubmit` runs, so the
 * values it validates are the ones on screen.
 *
 * @param formElement - The submitting `<form>`; pass `event.currentTarget`.
 * @param form - The `getValues`/`setValue` pair from this form's `useForm`.
 * @param fields - Names of the registered fields to reconcile. Listed
 *   explicitly rather than discovered, so inputs deliberately held outside
 *   `react-hook-form` (the promo code fields) are never written to.
 */
export const syncAutofilledFields = <TValues extends FieldValues>(
  formElement: HTMLFormElement,
  {
    getValues,
    setValue,
  }: Pick<UseFormReturn<TValues>, "getValues" | "setValue">,
  fields: readonly Path<TValues>[],
) => {
  for (const name of fields) {
    const input = formElement.elements.namedItem(name);
    if (!(input instanceof HTMLInputElement)) continue;
    if (input.value === getValues(name)) continue;

    // `setValue` writes through to the values `handleSubmit` validates
    // synchronously, so reconciling here is enough — no re-render needed first.
    setValue(name, input.value as PathValue<TValues, typeof name>, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }
};
