import { Carousel } from "@/components/commons/carousel/carousel";
import type { DocumentType } from "@/types/template";

import { MarketplaceCategoryTile } from "./marketplace-category-tile";

interface Props {
  categories: readonly DocumentType[];
  onChange: (documentType: "all" | DocumentType) => void;
  value: "all" | DocumentType;
}

export const MarketplaceCategoryNav = ({ categories, onChange, value }: Props) => (
  <section aria-labelledby="marketplace-categories-heading" className="marketplace-category-nav min-w-0 rounded-box border border-steel-mist bg-base-100 p-4 lg:border-0 lg:bg-transparent lg:p-0">
    <div className="mb-3 flex items-center justify-between gap-4">
      <div>
        <p className="font-title text-xs font-bold uppercase tracking-widest text-nox-noir/55">
          Browse by category
        </p>
        <h2
          className="mt-1 font-title text-xl font-bold text-nox-noir"
          id="marketplace-categories-heading"
        >
          Find the document you need
        </h2>
      </div>
    </div>

    <div className="lg:hidden">
      <Carousel
        ariaLabel="Document categories"
        trackClassName="gap-3"
        viewportClassName="mt-0 py-0"
      >
        {(["all", ...categories] as const).map((documentType) => (
          <div className="shrink-0" key={documentType}>
            <MarketplaceCategoryTile
              compact
              documentType={documentType}
              isActive={value === documentType}
              onSelect={onChange}
            />
          </div>
        ))}
      </Carousel>
    </div>

    <div className="hidden min-w-0 gap-3 overflow-x-auto pb-1 lg:flex">
      <MarketplaceCategoryTile
        documentType="all"
        isActive={value === "all"}
        onSelect={onChange}
      />
      {categories.map((documentType) => (
        <MarketplaceCategoryTile
          documentType={documentType}
          isActive={value === documentType}
          key={documentType}
          onSelect={onChange}
        />
      ))}
    </div>
  </section>
);

export default MarketplaceCategoryNav;
