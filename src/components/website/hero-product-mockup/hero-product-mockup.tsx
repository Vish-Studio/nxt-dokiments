import Image from "next/image";

import { heroScenes } from "@/lib/website/app-screens";
import { cn } from "@/lib/utils";

/** Which scene to show: the `id` of a hero step in `hero-intro-steps.ts`. */
export type HeroSceneId = keyof typeof heroScenes;

export interface HeroProductMockupProps {
  /**
   * The active hero step, which picks the phone scene. Defaults to the first
   * one, "template". Desktop always shows the workspace photo.
   */
  activeStepId?: HeroSceneId;
}

const sceneIds = Object.keys(heroScenes) as HeroSceneId[];

/**
 * The hero's product shot.
 *
 * - **Desktop (`lg` and up):** the workspace photo, the dashboard on a laptop
 *   on a log, with the app on an iPhone floating over it.
 * - **Phones and tablets:** a device scene that follows the hero's steps (the
 *   marketplace on a laptop, a client prefilled on phones, the finished PDF).
 *   The scenes are real app screens composed by `npm run capture:marketing`.
 *   All three are mounted and cross-fade, so switching steps never waits on a
 *   download; only the active one is announced.
 *
 * Each layout's `sizes` asks for a 1px image where it is hidden, so neither
 * downloads the other's full-size picture.
 */
export const HeroProductMockup = ({
  activeStepId = "template",
}: HeroProductMockupProps) => {
  return (
    <div className="hero-product-mockup website-hero-visual p-3 lg:h-full lg:p-4">
      <div className="relative hidden h-full w-full overflow-hidden rounded-box bg-nox-noir lg:block">
        <Image
          alt="Dokiments workspace displayed on a laptop"
          className="object-cover object-[40%_50%]"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 1px"
          src="/images/mockups/hero-laptop-rock.webp"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-nox-noir/15"
        />

        <Image
          alt="Dokiments dashboard displayed on a mobile phone"
          className="website-float-delayed absolute bottom-4 right-4 z-10 h-auto w-1/4 max-w-44 sm:bottom-8 sm:right-8"
          height={1291}
          sizes="(min-width: 1024px) 12vw, 1px"
          src="/images/mockups/hero-mobile-cutout.webp"
          width={640}
        />
      </div>

      <div className="relative aspect-4/3 w-full overflow-hidden rounded-box bg-nox-noir lg:hidden">
        {sceneIds.map((id) => {
          const scene = heroScenes[id];
          const isActive = id === activeStepId;

          return (
            <Image
              alt={isActive ? scene.alt : ""}
              aria-hidden={!isActive}
              className={cn(
                "object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none",
                scene.position,
                isActive ? "opacity-100" : "opacity-0",
              )}
              fill
              key={id}
              priority={id === "template"}
              sizes="(min-width: 1024px) 1px, 100vw"
              src={scene.src}
            />
          );
        })}
      </div>
    </div>
  );
};
