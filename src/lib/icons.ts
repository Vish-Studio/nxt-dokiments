import type { IconWeight } from "@phosphor-icons/react";

/**
 * The Phosphor icon size scale, in pixels, one entry per set of elements.
 *
 * Icons in the same set must look identical wherever they appear, so pick the
 * entry for the element you are building instead of a raw number. The scale and
 * which elements belong to each set are described in the `dokiments-ui` skill
 * ("Icon sizes").
 *
 * @example
 * <FileTextIcon aria-hidden size={iconSize.nav} weight={navIconWeight(isActive)} />
 */
export const iconSize = {
  /** Small inline icons next to `text-xs`/`text-sm` copy: pills, metadata, hints. */
  inline: 14,
  /** Icon-only buttons in the page header row: notification bell, refresh, sidebar toggle. */
  header: 15,
  /** Icons inside text buttons, dropdown and menu items, toolbars and toasts. */
  control: 16,
  /**
   * `TabMenu` tabs. Smaller than `nav` because the tabs are compact `text-sm`
   * pills, where a 19px icon outweighs the label.
   */
  tab: 16,
  /** Navigation rows: sidebar items and the desktop Settings section list. */
  nav: 19,
  /** Icons in coloured tiles on cards, banners and list rows. */
  tile: 20,
  /** Feature icons that headline a dialog or empty state. */
  feature: 24,
} as const;

/**
 * The Phosphor weight for a navigation or tab icon (`iconSize.nav` and
 * `iconSize.tab`).
 *
 * Shared so the sidebar, tab menus and Settings nav mark the active item the
 * same way: filled when active, bold otherwise.
 *
 * @param isActive - Whether the item is the current page, tab or section.
 */
export const navIconWeight = (isActive: boolean): IconWeight =>
  isActive ? "fill" : "bold";
