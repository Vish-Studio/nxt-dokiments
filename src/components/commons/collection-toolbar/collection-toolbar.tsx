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
