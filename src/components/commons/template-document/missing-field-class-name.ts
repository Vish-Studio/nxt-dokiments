/**
 * The yellow highlight on a field the author left empty, shown in the editor
 * preview after they try to save. Applied to a `<mark>` around the field's
 * placeholder text; `box-decoration-clone` keeps the highlight on every line
 * of multi-line placeholders.
 */
export const missingFieldClassName =
  "template-document-missing rounded-sm bg-golden-harvest/70 px-1 not-italic text-nox-noir/70 box-decoration-clone";
