# Shared UI primitives (Next 16, React 19, Tailwind 4 + daisyUI 5, Phosphor icons, Urbanist font)

### `src/components/commons/button/button.tsx`
```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import type { AnalyticsTrigger } from "@/lib/analytics/events";
import { toAnalyticsAttributes } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "neutral"
  | "ghost"
  | "outline"
  | "danger"
  | "danger-outline";
type ButtonSize = "sm" | "md" | "lg";
type ButtonIconMotion = "left" | "right" | "up-right";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  analytics?: AnalyticsTrigger;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconMotion?: ButtonIconMotion;
  iconPosition?: "left" | "right";
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "btn-primary hover:bg-steel-mist border-steel-mist hover:text-nox-noir",
  accent:
    "border border-transparent bg-golden-harvest text-nox-noir hover:brightness-95",
  secondary:
    "border border-transparent bg-base-200 text-nox-noir hover:bg-base-300",
  neutral: "btn-neutral",
  ghost: "btn-ghost",
  outline:
    "border border-steel-mist bg-transparent text-nox-noir hover:bg-base-200",
  danger: "btn-error",
  // A delete beside a main action: red, but quieter than the solid `danger`.
  "danger-outline":
    "border border-error/50 bg-transparent text-error hover:border-error hover:bg-error/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm min-h-10 h-10 px-4 text-sm",
  md: "min-h-11 h-11 px-5 text-sm",
  lg: "btn-lg min-h-12 h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      analytics,
      children,
      className,
      variant = "primary",
      size = "md",
      icon,
      iconMotion,
      iconPosition = "right",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const renderedIcon = icon ? (
      <span
        className={cn(iconMotion ? "button-arrow-icon" : null)}
        data-direction={iconMotion}
      >
        {icon}
      </span>
    ) : null;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "btn group rounded-field font-title transition-all duration-200",
          // Accent is a page's main action: bold, like the accent LinkButton
          // ("Browse marketplace"), so the two read as the same button.
          variant === "accent" ? "font-bold" : "font-semibold",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...toAnalyticsAttributes(analytics)}
        {...props}
      >
        {iconPosition === "left" ? renderedIcon : null}
        {children}
        {iconPosition === "right" ? renderedIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";
```

### `src/components/commons/badge/badge.tsx`
```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "accent"
  | "free"
  | "gold"
  | "neutral"
  | "noir"
  | "silver"
  | "special"
  | "success"
  | "superadmin";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  accent: "bg-golden-harvest text-nox-noir",
  free: "bg-success text-success-content",
  gold: "bg-golden-harvest text-nox-noir ",
  neutral: "bg-base-200 text-nox-noir/65",
  noir: "bg-nox-noir text-white",
  silver: "bg-nox-noir text-white",
  special: "bg-play-purple text-nox-noir",
  success: "bg-success text-success-content",
  superadmin: "bg-nox-noir text-golden-harvest",
};

export const Badge = ({ children, className, icon, variant = "neutral" }: BadgeProps) => {
  return (
    <span
      className={cn(
        "badge inline-flex items-center gap-1 rounded-field px-2.5 py-1 font-title text-xs font-semibold border-0",
        variantClasses[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
};
```

### `src/components/commons/input/input.tsx`
```tsx
"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import type { InputHTMLAttributes } from "react";
import { forwardRef, useState } from "react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, label, type = "text", ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === "password";
    const resolvedType = isPasswordField && isPasswordVisible ? "text" : type;

    return (
      <label className="form-control w-full">
        {label ? (
          <span className="label pb-2">
            <span className="label-text font-title text-sm font-semibold text-nox-noir">
              {label}
            </span>
          </span>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error && id ? `${id}-error` : undefined}
            className={cn(
              "input w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors placeholder:text-nox-noir/40 focus:border-nox-noir focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-nox-noir/15",
              isPasswordField ? "pr-11" : null,
              error
                ? "border-error focus:border-error focus:ring-error/20"
                : null,
              className,
            )}
            id={id}
            type={resolvedType}
            {...props}
          />
          {isPasswordField ? (
            <ButtonIcon
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-1 my-auto border-0 bg-transparent text-nox-noir/50 hover:bg-transparent hover:text-nox-noir"
              icon={
                isPasswordVisible ? (
                  <EyeSlashIcon
                    aria-hidden
                    size={18}
                    weight="bold"
                  />
                ) : (
                  <EyeIcon
                    aria-hidden
                    size={18}
                    weight="bold"
                  />
                )
              }
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              size="sm"
              variant="ghost"
            />
          ) : null}
        </div>
        {error ? (
          <span className="label pt-2">
            <span
              className="label-text-alt text-error"
              id={id ? `${id}-error` : undefined}
            >
              {error}
            </span>
          </span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = "Input";
```

### `src/components/commons/tab-menu/tab-menu.tsx`
```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface TabMenuItem {
  badge?: ReactNode;
  id: string;
  icon?: ReactNode | ((isActive: boolean) => ReactNode);
  label: string;
}

export interface TabMenuProps {
  ariaLabel: string;
  className?: string;
  /**
   * Phones (below `sm`): inactive tabs show only their icon and share the
   * width equally; the active tab adds its label to the right of its icon. Every tab stays visible instead of scrolling off the edge, and each
   * keeps its full label as its accessible name. From `sm` the menu looks as
   * usual. Needs an icon on every item.
   */
  fitOnPhones?: boolean;
  items: TabMenuItem[];
  onChange: (id: string) => void;
  value: string;
}

export const TabMenu = ({ ariaLabel, className, fitOnPhones = false, items, onChange, value }: TabMenuProps) => {
  return (
    <div className={cn("tab-menu min-w-0", className)}>
      <div
        aria-label={ariaLabel}
        className={cn(
          "flex gap-1 overflow-x-auto overflow-y-hidden rounded-tab bg-base-200 p-1",
          fitOnPhones && "max-sm:overflow-x-visible",
        )}
        role="tablist"
      >
        {items.map((item) => {
          const isActive = item.id === value;
          const icon = typeof item.icon === "function" ? item.icon(isActive) : item.icon;

          return (
            <button
              // Phones hide inactive labels; assistive tech still hears them.
              aria-label={fitOnPhones ? item.label : undefined}
              aria-selected={isActive}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 font-title text-sm font-semibold transition-colors sm:px-4 sm:text-sm",
                fitOnPhones &&
                  (isActive
                    ? "max-sm:min-w-0 max-sm:justify-center max-sm:px-4"
                    : "max-sm:min-w-0 max-sm:flex-1 max-sm:justify-center max-sm:px-0"),
                isActive
                  ? "bg-nox-noir text-white"
                  : "text-nox-noir/55 hover:bg-base-100/55 hover:text-nox-noir",
              )}
              key={item.id}
              onClick={() => onChange(item.id)}
              role="tab"
              type="button"
            >
              {icon ? <span className="shrink-0">{icon}</span> : null}
              {fitOnPhones ? (
                <span className={cn("inline-flex min-w-0 items-center gap-2", !isActive && "max-sm:hidden")}>
                  <span className="truncate">{item.label}</span>
                  {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
                </span>
              ) : (
                <>
                  <span>{item.label}</span>
                  {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

### `src/components/commons/empty-state/empty-state.tsx`
```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /**
   * The one button or link that gets the user out of this state ("Add client",
   * "Clear filters", "Try again"). Every empty and error state should offer one.
   */
  action?: ReactNode;
  /** Extra classes for the root, for example a different minimum height. */
  className?: string;
  /** One or two short sentences on what happened or what will appear here. */
  description: ReactNode;
  /** A Phosphor icon at `iconSize.feature`, `aria-hidden`. Optional. */
  icon?: ReactNode;
  /** What is missing ("Nothing shared with you yet"). */
  title: string;
  /**
   * `default` for nothing-to-show states. `error` for a failed request: a red
   * dashed border and icon tile, announced as an alert, so a failure is never
   * mistaken for "you have no data".
   */
  tone?: "default" | "error";
}

/**
 * The dashed placeholder a list shows when it has nothing to show or could not
 * load.
 *
 * It grows (`flex-1`) to fill a flex-column parent, so an empty tab ends at
 * the same place a full list would instead of stopping halfway down the page.
 * Its content is one centred group: icon, title, description, then the action,
 * kept together rather than spread over the box.
 *
 * @example
 * <EmptyState
 *   action={<Button onClick={addClient}>Add client</Button>}
 *   description="Add a client to keep their details close at hand."
 *   icon={<UsersThreeIcon aria-hidden size={iconSize.feature} weight="bold" />}
 *   title="No clients yet"
 * />
 */
export const EmptyState = ({
  action,
  className,
  description,
  icon,
  title,
  tone = "default",
}: EmptyStateProps) => (
  <section
    className={cn(
      "empty-state flex min-h-72 w-full flex-1 flex-col items-center justify-center rounded-box border border-dashed bg-base-100 p-10 text-center",
      tone === "error" ? "border-error/40" : "border-steel-mist",
      className,
    )}
    role={tone === "error" ? "alert" : undefined}
  >
    {icon ? (
      <span
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-box",
          tone === "error"
            ? "bg-error/10 text-error"
            : "bg-base-200 text-nox-noir",
        )}
      >
        {icon}
      </span>
    ) : null}
    <h2 className="font-title text-base font-bold text-nox-noir">{title}</h2>
    <p className="mt-1 max-w-sm text-sm leading-6 text-nox-noir/60">
      {description}
    </p>
    {action ? <div className="mt-5">{action}</div> : null}
  </section>
);
```

### `src/components/commons/collection-toolbar/collection-toolbar.tsx`
```tsx
"use client";

import { CaretDownIcon, FunnelIcon, MagnifyingGlassIcon, SortAscendingIcon, XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Badge } from "@/components/commons/badge/badge";
import { cn } from "@/lib/utils";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { Button } from "@/components/commons/button/button";
import { Dropdown, dropdownControlClassName } from "@/components/commons/dropdown/dropdown";
import { Input } from "@/components/commons/input/input";
import type { SelectOption } from "@/components/commons/select/select";

export interface CollectionFilter {
  id: string;
  label: string;
  value: string;
  defaultValue: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export interface CollectionToolbarProps {
  ariaLabel: string;
  appearance?: "default" | "header-dark" | "compact";
  layout?: "standard" | "header" | "header-search";
  variant?: "surface" | "embedded";
  searchLabel: string;
  searchPlaceholder?: string;
  search: string;
  onSearch: (value: string) => void;
  sort: string;
  sortOptions: SelectOption[];
  onSort: (value: string) => void;
  filters?: CollectionFilter[];
  resultLabel?: string;
  canReset?: boolean;
  /**
   * Shows every control but disabled, for a view the toolbar doesn't apply to
   * (for example "Shared with me"). Keeping the controls in place avoids a
   * layout shift when switching tabs. Hides the reset button.
   */
  disabled?: boolean;
  endAction?: ReactNode;
  /**
   * "menu" (default): one Filter button whose menu holds every filter, with
   * removable pills for the active ones. "chips": one dropdown chip per filter
   * ("Status Any ▾"), dark when set, so the value is always visible. On phones
   * chips collapse into one filter icon beside the sort icon, so search,
   * filter and sort always sit on one row whatever the filters are (the icon is
   * disabled when there are none, with a dot when any is set).
   */
  filterStyle?: "chips" | "menu";
  onCollectionChange?: () => void;
  onReset: () => void;
}

const CollectionToolbar = ({
  appearance = "default", layout = "standard", variant = "surface", ariaLabel, searchLabel, searchPlaceholder = "Search…", search, onSearch,
  sort, sortOptions, onSort, filters = [], resultLabel, canReset: canResetProp = false, disabled = false, endAction, filterStyle = "menu", onCollectionChange, onReset,
}: CollectionToolbarProps) => {
  const hasFilterChips = filterStyle === "chips";
  const canReset = canResetProp && !disabled;
  const isHeaderLayout = layout === "header";
  const isHeaderSearchOnly = layout === "header-search";
  const hasDarkHeaderAppearance = appearance === "header-dark";
  const hasCompactAppearance = appearance === "compact";
  const activeFilters = filters.filter((filter) => filter.value !== filter.defaultValue);
  const controlClassName = cn(
    dropdownControlClassName,
    "size-10 shrink-0 px-0! sm:w-auto sm:px-3!",
    hasDarkHeaderAppearance && "lg:border-nox-noir/15 lg:bg-white/45 lg:text-nox-noir lg:hover:border-nox-noir/25 lg:hover:bg-white/65 lg:aria-expanded:bg-white/65",
    hasCompactAppearance && "lg:h-9 lg:min-h-9 lg:gap-1.5 lg:rounded-field lg:border lg:border-steel-mist/60 lg:bg-base-200 lg:px-3! lg:text-xs lg:hover:bg-base-100 lg:aria-expanded:bg-base-100",
  );
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? "Sort";

  return (
    <section aria-label={ariaLabel} className={cn("collection-toolbar relative grid gap-3", variant === "surface" && "pb-2", isHeaderLayout && "lg:grid-cols-[minmax(0,1fr)_minmax(20rem,32rem)_minmax(0,1fr)] lg:items-center lg:gap-y-2", isHeaderSearchOnly && "w-full", hasCompactAppearance && "pb-0 lg:flex lg:items-center lg:gap-3", disabled && "[&_:disabled]:cursor-not-allowed [&_:disabled]:opacity-50")}>
      <div className={cn("flex flex-wrap items-center gap-3", isHeaderLayout && "lg:contents", hasCompactAppearance && "lg:flex-none")}>
        <div className={cn("relative min-w-0 flex-1 basis-0 sm:mr-auto sm:max-w-sm", isHeaderLayout && "lg:col-start-2 lg:row-start-1 lg:w-full lg:max-w-none lg:justify-self-center", isHeaderSearchOnly && "w-full basis-full sm:!mr-0 sm:!max-w-none")}>
          <span className={cn("pointer-events-none absolute left-3 top-0 z-10 flex h-10 items-center text-nox-noir/45", hasDarkHeaderAppearance && "lg:text-nox-noir/55")}>
            <MagnifyingGlassIcon aria-hidden size={18} weight="bold" />
          </span>
          <Input
            aria-label={searchLabel}
            disabled={disabled}
            className={cn("h-10 rounded-field border-transparent! pl-10 pr-10 font-body text-base! lg:text-sm! focus:border-nox-noir/20!", isHeaderSearchOnly && "lg:rounded-full", hasDarkHeaderAppearance && "lg:bg-white/45! lg:text-nox-noir lg:placeholder:text-nox-noir/50 lg:focus:border-nox-noir/25!")}
            placeholder={searchPlaceholder}
            role="searchbox"
            type="text"
            value={search}
            onChange={(event) => {
              onSearch(event.target.value);
              onCollectionChange?.();
            }}
          />
          {search && !disabled ? <ButtonIcon aria-label="Clear search" className="collection-toolbar-clear-search group absolute right-0 top-0 rounded-field! border-0! bg-transparent! hover:bg-transparent! lg:rounded-full!" icon={<span className={cn("collection-toolbar-clear-icon flex size-7 items-center justify-center rounded-field lg:rounded-full lg:group-hover:bg-nox-noir/10", hasDarkHeaderAppearance && "lg:group-hover:bg-white/35")}><XIcon aria-hidden size={16} /></span>} onClick={() => { onSearch(""); onCollectionChange?.(); }} shape="square" size="sm" variant="ghost" /> : null}
        </div>
        <div className={cn("flex shrink-0 items-center gap-3", isHeaderLayout && "lg:col-start-3 lg:row-start-1 lg:justify-self-end", isHeaderSearchOnly && "hidden", hasCompactAppearance && "lg:gap-2", hasFilterChips && "max-sm:gap-2")}>
          {hasFilterChips ? filters.map((filter) => {
            const isActive = filter.value !== filter.defaultValue;
            const valueLabel = isActive ? filter.options.find((option) => option.value === filter.value)?.label ?? filter.value : "Any";
            return (
              <Dropdown
                align="start"
                ariaLabel={`${filter.label}: ${valueLabel}`}
                // Phones: the chips share the row and stretch to its end.
                buttonClassName={cn(controlClassName, "w-auto! px-3!", isActive && "border-nox-noir! bg-nox-noir! text-white! hover:bg-nox-noir/90!")}
                className="static shrink-0 max-sm:hidden sm:relative"
                disabled={disabled}
                groups={[{ label: filter.label, value: filter.value, options: filter.options, onChange: (value) => { filter.onChange(value); onCollectionChange?.(); } }]}
                key={filter.id}
                menuClassName="left-0 w-full sm:left-auto sm:w-64"
                sheetIcon={FunnelIcon}
                sheetTitle={filter.label}
                trigger={<><span className={isActive ? "text-white/70" : "text-nox-noir/55"}>{filter.label}</span><span className="max-w-32 truncate font-semibold">{valueLabel}</span><CaretDownIcon aria-hidden className="shrink-0" size={hasCompactAppearance ? 11 : 12} /></>}
              />
            );
          }) : null}
          {hasFilterChips ? (
            <Dropdown
              align="start"
              ariaLabel={activeFilters.length ? `Filters (${activeFilters.length} active)` : "Filters"}
              buttonClassName={cn(controlClassName, "relative")}
              className="static shrink-0 sm:hidden"
              closeOnSelect={false}
              disabled={disabled || filters.length === 0}
              groups={filters.map((filter) => ({ label: filter.label, value: filter.value, options: filter.options, onChange: (value) => { filter.onChange(value); onCollectionChange?.(); } }))}
              menuClassName="left-0 w-full"
              // Phones reset filters here, not in an extra header row.
              sheetSecondaryAction={{ disabled: !canReset, label: "Clear filters", onClick: () => { onReset(); onCollectionChange?.(); } }}
              sheetIcon={FunnelIcon}
              sheetTitle="Filters"
              trigger={<><FunnelIcon aria-hidden size={17} />{activeFilters.length ? <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-nox-noir" /> : null}</>}
            />
          ) : null}
          <Dropdown
            align="start"
            ariaLabel="Sort"
            className="static shrink-0 sm:relative"
            buttonClassName={controlClassName}
            disabled={disabled}
            menuClassName="left-0 w-full sm:left-auto sm:w-64"
            sheetIcon={SortAscendingIcon}
            sheetTitle="Sort"
            groups={[{ label: "Sort by", value: sort, options: sortOptions, onChange: (value) => { onSort(value); onCollectionChange?.(); } }]}
            trigger={<><SortAscendingIcon aria-hidden size={hasCompactAppearance ? 15 : 17} /><span className="hidden sm:inline">{sortLabel}</span><CaretDownIcon aria-hidden className="hidden sm:block" size={hasCompactAppearance ? 11 : 12} /></>}
          />
          {filters.length > 0 && !hasFilterChips ? (
            <Dropdown
              align="start"
              ariaLabel="Filters"
              className="static shrink-0 sm:relative"
              buttonClassName={controlClassName}
              closeOnSelect={false}
              disabled={disabled}
              menuClassName="left-0 w-full sm:left-auto sm:w-72"
              sheetIcon={FunnelIcon}
              sheetTitle="Filters"
              groups={filters.map((filter) => ({ label: filter.label, value: filter.value, options: filter.options, onChange: (value) => { filter.onChange(value); onCollectionChange?.(); } }))}
              trigger={<><FunnelIcon aria-hidden size={hasCompactAppearance ? 15 : 17} /><span className="hidden sm:inline">Filter</span>{activeFilters.length ? <span className="hidden sm:inline-flex"><Badge variant="neutral">{activeFilters.length}</Badge></span> : null}<CaretDownIcon aria-hidden className="hidden sm:block" size={hasCompactAppearance ? 11 : 12} /></>}
            />
          ) : null}
          {canReset ? <Button aria-label="Reset filters" className={cn("hidden text-nox-noir/55 hover:text-nox-noir sm:inline-flex", hasDarkHeaderAppearance && "lg:text-nox-noir/65 lg:hover:text-nox-noir")} size="sm" variant="ghost" onClick={() => { onReset(); onCollectionChange?.(); }}>{hasFilterChips ? "Clear filters" : "Clear all"}</Button> : null}
        </div>
      </div>
      {!isHeaderSearchOnly && (resultLabel || canReset || (!hasFilterChips && activeFilters.length)) ? <div className={cn("flex flex-wrap items-center gap-2", !resultLabel && (hasFilterChips || !activeFilters.length) && "sm:hidden", hasFilterChips && "max-sm:sr-only", isHeaderLayout && "lg:col-start-2 lg:row-start-2 lg:w-full")}>
        {/* Chips on phones: the count is announced but not shown, and
            "Clear filters" lives in the Filters sheet, so the header stays one
            row. */}
        {resultLabel ? <p role="status" className={cn("mr-auto text-xs text-nox-noir/50", hasFilterChips && "max-sm:sr-only")}>{resultLabel}</p> : null}
        {canReset && !hasFilterChips ? <Button aria-label="Reset filters" className="text-nox-noir/55 hover:text-nox-noir sm:hidden" size="sm" variant="ghost" onClick={() => { onReset(); onCollectionChange?.(); }}>{hasFilterChips ? "Clear filters" : "Clear all"}</Button> : null}
        {(hasFilterChips ? [] : activeFilters).map((filter) => (
          <Button
            aria-label={`Remove ${filter.label} filter`}
            className="rounded-full border border-steel-mist/50 font-medium"
            icon={<XIcon aria-hidden size={12} weight="bold" />}
            key={filter.id}
            onClick={() => { filter.onChange(filter.defaultValue); onCollectionChange?.(); }}
            size="sm"
            variant="secondary"
          >
            {filter.options.find((option) => option.value === filter.value)?.label ?? filter.value}
          </Button>
        ))}
      </div> : null}
      {endAction ? <div className="hidden lg:ml-auto lg:block">{endAction}</div> : null}
    </section>
  );
};

export default CollectionToolbar;
```

### `src/components/commons/template-card/template-card.tsx`
```tsx
import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";
import { getTemplateDisplayName } from "@/lib/market-place/document-labels";

export interface TemplateCardProps {
  className?: string;
  variant?: "default" | "gallery";
  locked?: boolean;
  onPreview: () => void;
  saved?: boolean;
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

export const TemplateCard = ({
  className,
  variant = "default",
  locked = false,
  onPreview,
  saved = false,
  template,
  values,
}: TemplateCardProps) => {
  return (
    <button
      aria-label={`Preview ${getTemplateDisplayName(template)}${saved ? ", saved" : ""}${locked ? ", locked" : ""}`}
      className={cn(
        "template-card group block overflow-visible rounded-box bg-transparent p-2 text-left transition-colors duration-200 hover:bg-base-200 focus:outline-none focus-visible:bg-base-200 focus-visible:ring-2 focus-visible:ring-nox-noir/20",
        variant === "gallery" ? "w-full min-w-0" : "mx-auto w-64 sm:w-72",
        saved && "focus-visible:ring-golden-harvest/55",
        className,
      )}
      onClick={onPreview}
      type="button"
    >
      <TemplateThumbnail
        compact={variant === "gallery"}
        className="rounded-box bg-base-100 shadow-soft"
        template={template}
        values={values}
      />
      {variant === "gallery" ? (
        <span className="mt-3 block text-center">
          <span className="block font-title text-sm font-semibold leading-5 text-nox-noir">
            {getTemplateDisplayName(template)}
          </span>
          <span className="mt-1 block text-xs leading-5 text-nox-noir/60">
            {template.style.name}
          </span>
        </span>
      ) : null}
    </button>
  );
};

export default TemplateCard;
```

### `src/components/commons/template-thumbnail/template-thumbnail.tsx`
```tsx
import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { getSampleValues } from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplateThumbnailProps = {
  className?: string;
  compact?: boolean;
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

/**
 * A non-interactive, scaled-down preview of a rendered template. Defaults to
 * sample content so marketplace previews show how a filled document looks.
 */
export const TemplateThumbnail = ({
  className,
  compact = false,
  template,
  values,
}: TemplateThumbnailProps) => {
  const resolvedValues = values ?? getSampleValues(template.documentType);

  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-210/297 w-full overflow-visible bg-transparent",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 origin-top-left overflow-hidden",
          compact ? "h-[400%] w-[400%] scale-25" : "h-[200%] w-[200%] scale-50",
        )}
      >
        <TemplateDocument
          className="h-full min-h-full"
          template={template}
          values={resolvedValues}
        />
      </div>
    </div>
  );
};

export default TemplateThumbnail;
```

### `src/components/commons/template-card-skeleton/template-card-skeleton.tsx`
```tsx
import { cn } from "@/lib/utils";

export type TemplateCardSkeletonProps = {
  className?: string;
};

/** Shimmer placeholder matching `TemplateCard`'s aspect ratio, for use while a template list is loading. */
export const TemplateCardSkeleton = ({
  className,
}: TemplateCardSkeletonProps) => (
  <div
    aria-hidden
    className={cn("skeleton aspect-210/297 w-full rounded-box", className)}
  />
);

export type TemplateCardSkeletonGridProps = {
  className?: string;
  count?: number;
};

/** Grid of `TemplateCardSkeleton`s matching the layout used by My Templates and the Documents template picker. */
export const TemplateCardSkeletonGrid = ({
  className,
  count = 6,
}: TemplateCardSkeletonGridProps) => (
  <div
    aria-hidden
    className={cn("grid", className ?? "gap-4 sm:grid-cols-2 xl:grid-cols-3")}
  >
    {Array.from({ length: count }, (_, index) => (
      <TemplateCardSkeleton key={index} />
    ))}
  </div>
);
```

### `src/components/commons/floating-action-button/floating-action-button.tsx`
```tsx
import Link from "next/link";
import type { ReactNode } from "react";

import {
  ButtonIcon,
  buttonIconClasses,
} from "@/components/commons/button-icon/button-icon";
import { Button } from "@/components/commons/button/button";
import { cn } from "@/lib/utils";

/**
 * `"auto"` keeps the responsive default: a circle on mobile that grows into a
 * labelled pill from `sm` up. `"circle"` stays icon-only at every breakpoint —
 * for pages where the surrounding layout already names the action.
 */
type FloatingActionButtonShape = "auto" | "circle";

export type FloatingActionButtonProps = {
  className?: string;
  /**
   * Renders a `next/link` anchor instead of a button, and takes precedence over
   * `onClick`. The anchor form is always circular — `shape` governs the button
   * form only, since there is no pill anchor variant.
   */
  href?: string;
  icon: ReactNode;
  /** Visible text in `"auto"` shape; the accessible name in both shapes. */
  label: string;
  /** Required unless `href` is set. */
  onClick?: () => void;
  shape?: FloatingActionButtonShape;
};

export const FloatingActionButton = ({
  className,
  href,
  icon,
  label,
  onClick,
  shape = "auto",
}: FloatingActionButtonProps) => {
  return (
    <div
      className={cn(
        "floating-action-button fixed bottom-6 lg:bottom-10 right-5 z-50 sm:bottom-6 sm:right-10",
        className,
      )}
    >
      {href ? (
        // A navigating FAB is a real anchor, so middle-click, cmd-click and
        // Next.js prefetching all behave as users expect from a link.
        <Link
          aria-label={label}
          className={buttonIconClasses({
            className: "shadow-none",
            size: "lg",
            variant: "accent",
          })}
          href={href}
          title={label}
        >
          {icon}
        </Link>
      ) : (
        <>
          <ButtonIcon
            aria-label={label}
            className={cn("shadow-none", shape === "auto" ? "sm:hidden" : null)}
            icon={icon}
            onClick={onClick}
            size="lg"
            title={label}
            variant="accent"
          />
          {shape === "auto" ? (
            <Button
              className="hidden shadow-none sm:inline-flex"
              icon={icon}
              iconPosition="left"
              onClick={onClick}
              size="md"
              variant="accent"
            >
              {label}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
};
```

### `src/lib/utils.ts`
```tsx
export const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Derives up to two uppercase initials from a display name, for avatar
 * placeholders.
 *
 * Splits on whitespace and takes the first letter of each of the first two
 * words — "Anthony Alverizko" -> "AA", "Anthony" -> "A". Falls back to "DU"
 * ("Dokiments User") when `name` is empty or contains no letters, so callers
 * never need their own empty-string guard.
 *
 * @param name - A user's display name. Not validated or trimmed beyond
 *   splitting on spaces — pass an already-sanitised value.
 * @returns One or two uppercase letters, or `"DU"` if none could be derived.
 */
export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DU";
```

### `src/lib/icons.ts`
```tsx
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
```
