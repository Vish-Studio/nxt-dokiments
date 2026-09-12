"use client";

import { CaretDownIcon, FunnelIcon, MagnifyingGlassIcon, SortAscendingIcon, XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Badge } from "@/components/commons/badge/badge";
import { cn } from "@/lib/utils";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { Button } from "@/components/commons/button/button";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
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
  endAction?: ReactNode;
  onCollectionChange?: () => void;
  onReset: () => void;
}

const CollectionToolbar = ({
  appearance = "default", layout = "standard", variant = "surface", ariaLabel, searchLabel, searchPlaceholder = "Search…", search, onSearch,
  sort, sortOptions, onSort, filters = [], resultLabel, canReset = false, endAction, onCollectionChange, onReset,
}: CollectionToolbarProps) => {
  const isHeaderLayout = layout === "header";
  const isHeaderSearchOnly = layout === "header-search";
  const hasDarkHeaderAppearance = appearance === "header-dark";
  const hasCompactAppearance = appearance === "compact";
  const activeFilters = filters.filter((filter) => filter.value !== filter.defaultValue);
  const controlClassName = cn(
    "size-10 shrink-0 gap-2 whitespace-nowrap rounded-field border border-steel-mist/70 bg-base-200 px-0! sm:w-auto sm:px-3! text-nox-noir hover:border-steel-mist hover:bg-base-200 aria-expanded:bg-base-200",
    hasDarkHeaderAppearance && "lg:border-nox-noir/15 lg:bg-white/45 lg:text-nox-noir lg:hover:border-nox-noir/25 lg:hover:bg-white/65 lg:aria-expanded:bg-white/65",
    hasCompactAppearance && "lg:h-9 lg:min-h-9 lg:gap-1.5 lg:rounded-field lg:border lg:border-steel-mist/60 lg:bg-base-200 lg:px-3! lg:text-xs lg:hover:bg-base-100 lg:aria-expanded:bg-base-100",
  );
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? "Sort";

  return (
    <section aria-label={ariaLabel} className={cn("collection-toolbar relative grid gap-3", variant === "surface" && "pb-2", isHeaderLayout && "lg:grid-cols-[minmax(0,1fr)_minmax(20rem,32rem)_minmax(0,1fr)] lg:items-center lg:gap-y-2", isHeaderSearchOnly && "w-full", hasCompactAppearance && "pb-0 lg:flex lg:items-center lg:gap-3")}>
      <div className={cn("flex flex-wrap items-center gap-3", isHeaderLayout && "lg:contents", hasCompactAppearance && "lg:flex-none")}>
        <div className={cn("relative min-w-0 flex-1 basis-0 sm:mr-auto sm:max-w-sm", isHeaderLayout && "lg:col-start-2 lg:row-start-1 lg:w-full lg:max-w-none lg:justify-self-center", isHeaderSearchOnly && "w-full basis-full sm:!mr-0 sm:!max-w-none")}>
          <span className={cn("pointer-events-none absolute left-3 top-0 z-10 flex h-10 items-center text-nox-noir/45", hasDarkHeaderAppearance && "lg:text-nox-noir/55")}>
            <MagnifyingGlassIcon aria-hidden size={18} weight="bold" />
          </span>
          <Input
            aria-label={searchLabel}
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
          {search ? <ButtonIcon aria-label="Clear search" className="collection-toolbar-clear-search group absolute right-0 top-0 rounded-field! border-0! bg-transparent! hover:bg-transparent! lg:rounded-full!" icon={<span className={cn("collection-toolbar-clear-icon flex size-7 items-center justify-center rounded-field lg:rounded-full lg:group-hover:bg-nox-noir/10", hasDarkHeaderAppearance && "lg:group-hover:bg-white/35")}><XIcon aria-hidden size={16} /></span>} onClick={() => { onSearch(""); onCollectionChange?.(); }} shape="square" size="sm" variant="ghost" /> : null}
        </div>
        <div className={cn("flex shrink-0 items-center gap-3", isHeaderLayout && "lg:col-start-3 lg:row-start-1 lg:justify-self-end", isHeaderSearchOnly && "hidden", hasCompactAppearance && "lg:gap-2")}>
          <Dropdown
            align="start"
            ariaLabel="Sort"
            className="static shrink-0 sm:relative"
            buttonClassName={controlClassName}
            menuClassName="left-0 w-full sm:left-auto sm:w-64"
            groups={[{ label: "Sort by", value: sort, options: sortOptions, onChange: (value) => { onSort(value); onCollectionChange?.(); } }]}
            trigger={<><SortAscendingIcon aria-hidden size={hasCompactAppearance ? 15 : 17} /><span className="hidden sm:inline">{sortLabel}</span><CaretDownIcon aria-hidden className="hidden sm:block" size={hasCompactAppearance ? 11 : 12} /></>}
          />
          {filters.length > 0 ? (
            <Dropdown
              align="start"
              ariaLabel="Filters"
              className="static shrink-0 sm:relative"
              buttonClassName={controlClassName}
              closeOnSelect={false}
              menuClassName="left-0 w-full sm:left-auto sm:w-72"
              groups={filters.map((filter) => ({ label: filter.label, value: filter.value, options: filter.options, onChange: (value) => { filter.onChange(value); onCollectionChange?.(); } }))}
              trigger={<><FunnelIcon aria-hidden size={hasCompactAppearance ? 15 : 17} /><span className="hidden sm:inline">Filter</span>{activeFilters.length ? <span className="hidden sm:inline-flex"><Badge variant="neutral">{activeFilters.length}</Badge></span> : null}<CaretDownIcon aria-hidden className="hidden sm:block" size={hasCompactAppearance ? 11 : 12} /></>}
            />
          ) : null}
          {canReset ? <Button aria-label="Reset filters" className={cn("hidden text-nox-noir/55 hover:text-nox-noir sm:inline-flex", hasDarkHeaderAppearance && "lg:text-nox-noir/65 lg:hover:text-nox-noir")} size="sm" variant="ghost" onClick={() => { onReset(); onCollectionChange?.(); }}>Clear all</Button> : null}
        </div>
      </div>
      {!isHeaderSearchOnly && (resultLabel || canReset || activeFilters.length) ? <div className={cn("flex flex-wrap items-center gap-2", !resultLabel && !activeFilters.length && "sm:hidden", isHeaderLayout && "lg:col-start-2 lg:row-start-2 lg:w-full")}>
        {resultLabel ? <p role="status" className="mr-auto text-xs text-nox-noir/50">{resultLabel}</p> : null}
        {canReset ? <Button aria-label="Reset filters" className="text-nox-noir/55 hover:text-nox-noir sm:hidden" size="sm" variant="ghost" onClick={() => { onReset(); onCollectionChange?.(); }}>Clear all</Button> : null}
        {activeFilters.map((filter) => (
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
