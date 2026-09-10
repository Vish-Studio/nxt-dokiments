"use client";

import { CaretDownIcon, FunnelIcon, MagnifyingGlassIcon, SortAscendingIcon, XIcon } from "@phosphor-icons/react";

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
  onReset: () => void;
}

const CollectionToolbar = ({
  variant = "surface", ariaLabel, searchLabel, searchPlaceholder = "Search…", search, onSearch,
  sort, sortOptions, onSort, filters = [], resultLabel, canReset = false, onReset,
}: CollectionToolbarProps) => {
  const activeFilters = filters.filter((filter) => filter.value !== filter.defaultValue);
  const controlClassName = "size-10 shrink-0 gap-2 rounded-field border border-steel-mist/70 bg-base-200 px-0! sm:w-auto sm:px-3! text-nox-noir hover:border-steel-mist hover:bg-base-200 aria-expanded:bg-base-200";
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label ?? "Sort";

  return (
    <section aria-label={ariaLabel} className={cn("collection-toolbar relative grid gap-3", variant === "surface" && "border-b border-steel-mist/60 pb-4")}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-0 sm:mr-auto sm:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-0 z-10 flex h-10 items-center text-nox-noir/45">
            <MagnifyingGlassIcon aria-hidden size={18} weight="bold" />
          </span>
          <Input
            aria-label={searchLabel}
            className="h-10 rounded-field border-transparent! pl-10 pr-10 font-body text-sm! focus:border-nox-noir/20!"
            placeholder={searchPlaceholder}
            role="searchbox"
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
          {search ? <ButtonIcon aria-label="Clear search" className="absolute right-0 top-0" icon={<XIcon aria-hidden size={16} />} onClick={() => onSearch("")} size="sm" variant="ghost" /> : null}
        </div>
        <Dropdown
          ariaLabel="Sort"
          className="static shrink-0 sm:relative"
          buttonClassName={controlClassName}
          menuClassName="left-0 w-full sm:left-auto sm:w-64"
          groups={[{ label: "Sort by", value: sort, options: sortOptions, onChange: onSort }]}
          trigger={<><SortAscendingIcon aria-hidden size={17} /><span className="hidden sm:inline">{sortLabel}</span><CaretDownIcon aria-hidden className="hidden sm:block" size={12} /></>}
        />
        {filters.length > 0 ? (
          <Dropdown
            ariaLabel="Filters"
            className="static shrink-0 sm:relative"
            buttonClassName={controlClassName}
            closeOnSelect={false}
            menuClassName="left-0 w-full sm:left-auto sm:w-72"
            groups={filters.map((filter) => ({ label: filter.label, value: filter.value, options: filter.options, onChange: filter.onChange }))}
            trigger={<><FunnelIcon aria-hidden size={17} /><span className="hidden sm:inline">Filter</span>{activeFilters.length ? <span className="hidden sm:inline-flex"><Badge variant="neutral">{activeFilters.length}</Badge></span> : null}<CaretDownIcon aria-hidden className="hidden sm:block" size={12} /></>}
          />
        ) : null}
        {canReset ? <Button aria-label="Reset filters" className="hidden text-nox-noir/55 hover:text-nox-noir sm:inline-flex" size="sm" variant="ghost" onClick={onReset}>Clear all</Button> : null}
      </div>
      {resultLabel || canReset || activeFilters.length ? <div className={cn("flex flex-wrap items-center gap-2", !resultLabel && !activeFilters.length && "sm:hidden")}>
        {resultLabel ? <p role="status" className="mr-auto text-xs text-nox-noir/50">{resultLabel}</p> : null}
        {canReset ? <Button aria-label="Reset filters" className="text-nox-noir/55 hover:text-nox-noir sm:hidden" size="sm" variant="ghost" onClick={onReset}>Clear all</Button> : null}
        {activeFilters.map((filter) => (
          <Button
            aria-label={`Remove ${filter.label} filter`}
            className="rounded-full border border-steel-mist/50 font-medium"
            icon={<XIcon aria-hidden size={12} weight="bold" />}
            key={filter.id}
            onClick={() => filter.onChange(filter.defaultValue)}
            size="sm"
            variant="secondary"
          >
            {filter.options.find((option) => option.value === filter.value)?.label ?? filter.value}
          </Button>
        ))}
      </div> : null}
    </section>
  );
};

export default CollectionToolbar;
