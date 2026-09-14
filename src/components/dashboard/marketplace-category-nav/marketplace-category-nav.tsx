import { Carousel } from "@/components/commons/carousel/carousel";
import type { DocumentType } from "@/types/template";

import { MarketplaceCategoryTile } from "./marketplace-category-tile";

interface Props {
  categories: readonly DocumentType[];
  onChange: (documentType: "all" | DocumentType) => void;
  value: "all" | DocumentType;
}

export const MarketplaceCategoryNav = ({ categories, onChange, value }: Props) => (
  <section aria-label="Browse by category" className="marketplace-category-nav min-w-0 rounded-box border border-steel-mist bg-base-100 p-4 lg:border-0 lg:bg-transparent lg:p-0">
    <div className="lg:hidden">
      <Carousel
        ariaLabel="Document categories"
        header={
          <h2
            className="font-title text-xl font-bold text-nox-noir"
          >
            Browse by category
          </h2>
        }
        navigationPlacement="header"
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

    <div className="hidden lg:block">
      <Carousel
        ariaLabel="Document categories"
        header={
          <h2
            className="font-title text-xl font-bold text-nox-noir"
          >
            Browse by category
          </h2>
        }
        navigationPlacement="header"
        trackClassName="gap-3"
        viewportClassName="mt-0 py-0"
      >
        <div className="shrink-0">
          <MarketplaceCategoryTile
            documentType="all"
            isActive={value === "all"}
            onSelect={onChange}
          />
        </div>
        {categories.map((documentType) => (
          <div className="shrink-0" key={documentType}>
            <MarketplaceCategoryTile
              documentType={documentType}
              isActive={value === documentType}
              onSelect={onChange}
            />
          </div>
        ))}
      </Carousel>
    </div>
  </section>
);

export default MarketplaceCategoryNav;
