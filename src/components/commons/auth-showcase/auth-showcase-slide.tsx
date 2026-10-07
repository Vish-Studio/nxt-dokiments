import Image from "next/image";

import { cn } from "@/lib/utils";

import {
  type AuthShowcaseSlideData,
  authShowcaseToneClasses,
} from "./auth-showcase-slides";

export interface AuthShowcaseSlideProps extends AuthShowcaseSlideData {
  id: string;
  isActive: boolean;
  isFirst?: boolean;
}

export const AuthShowcaseSlide = ({
  description,
  id,
  imageSrc,
  isActive,
  isFirst = false,
  layout,
  title,
  tone,
}: AuthShowcaseSlideProps) => {
  return (
    <article
      aria-hidden={!isActive}
      className={cn(
        "auth-showcase-slide absolute inset-0 flex flex-col transition-opacity duration-700 ease-out motion-reduce:transition-none",
        authShowcaseToneClasses[tone],
        isActive ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      id={id}
      role="tabpanel"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center px-10 pt-16 pb-48 xl:px-16">
        <div
          className={cn(
            "auth-showcase-visual relative w-full",
            layout === "framed"
              ? "aspect-square max-w-md overflow-hidden rounded-box border border-nox-noir/10 bg-white/45"
              : "aspect-video max-w-2xl overflow-hidden rounded-box border border-nox-noir/10 bg-white",
            isActive && "auth-showcase-visual-enter",
          )}
        >
          <Image
            alt=""
            className={
              layout === "framed"
                ? "object-cover"
                : "object-contain p-6"
            }
            fill
            loading="eager"
            preload={isFirst}
            sizes="(min-width: 1024px) 40vw, 1px"
            src={imageSrc}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-28 px-10 xl:px-12">
        <h2 className="font-title text-3xl font-bold tracking-tight text-nox-noir xl:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-lg text-base leading-7 text-nox-noir/70">
          {description}
        </p>
      </div>
    </article>
  );
};
