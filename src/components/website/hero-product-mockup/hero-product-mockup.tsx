import Image from "next/image";

import { heroScenes } from "@/lib/website/app-screens";
import { cn } from "@/lib/utils";

/** Which scene to show: the `id` of a hero step in `hero-intro-steps.ts`. */
export type HeroSceneId = keyof typeof heroScenes;

export interface HeroProductMockupProps {
  /**
   * The active hero step, which picks the scene. Defaults to the first one,
   * "template".
   */
  activeStepId?: HeroSceneId;
}

const sceneIds = Object.keys(heroScenes) as HeroSceneId[];
// Desktop keeps the workspace photo for step 1 and shows the scenes for the rest.
const desktopSceneIds = sceneIds.filter((id) => id !== "template");

/**
 * The hero's product shot.
 *
 * - **Desktop (`lg` and up):** step 1 (Template) shows the workspace photo,
 *   the dashboard on a laptop on a log with the app on an iPhone floating
 *   over it; steps 2 (Client) and 3 (Send PDF) show their own device scenes.
 *   They cross-fade as the step changes.
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
      <div className="hero-product-mockup-desktop relative hidden h-full w-full overflow-hidden rounded-box bg-nox-noir lg:block">
        {/* Step 1: the workspace photo, the dashboard on a laptop on a log. */}
        <div
          aria-hidden={activeStepId !== "template"}
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none",
            activeStepId === "template" ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            alt={
              activeStepId === "template"
                ? "Dokiments workspace displayed on a laptop"
                : ""
            }
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
            alt={
              activeStepId === "template"
                ? "Dokiments dashboard displayed on a mobile phone"
                : ""
            }
            className="website-float-delayed absolute bottom-4 right-4 z-10 h-auto w-1/4 max-w-44 sm:bottom-8 sm:right-8"
            height={1291}
            sizes="(min-width: 1024px) 12vw, 1px"
            src="/images/mockups/hero-mobile-cutout.webp"
            width={640}
          />
        </div>

        {/* Steps 2 and 3: their own device scenes, cross-fading in. */}
        {desktopSceneIds.map((id) => {
          const scene = heroScenes[id];
          const isActive = id === activeStepId;

          return (
            <Image
              alt={isActive ? scene.alt : ""}
              aria-hidden={!isActive}
              className={cn(
                "object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none",
                scene.position,
                isActive ? "opacity-100" : "opacity-0",
              )}
              fill
              key={id}
              sizes="(min-width: 1024px) 50vw, 1px"
              src={scene.src}
            />
          );
        })}
      </div>

      <div className="hero-product-mockup-phone relative aspect-4/3 w-full overflow-hidden rounded-box bg-nox-noir lg:hidden">
        {sceneIds.map((id) => {
          const scene = heroScenes[id];
          const isActive = id === activeStepId;

          return (
            <Image
              alt={isActive ? scene.alt : ""}
              aria-hidden={!isActive}
              className={cn(
                "object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none",
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
