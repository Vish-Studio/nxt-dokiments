import {
  Bell,
  DeviceMobile,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { ClientsShowcasePoint } from "@/components/website/clients-showcase-point/clients-showcase-point";
import { DevicePhone } from "@/components/website/device-phone/device-phone";
import { SectionHeading } from "@/components/website/section-heading/section-heading";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import { cn } from "@/lib/utils";
import { appScreens } from "@/lib/website/app-screens";

export interface MobileShowcaseProps {
  /**
   * Whether sharing is on, which decides if the notifications phone and the
   * signature wording appear. Defaults to the `documentSharingEnabled` flag;
   * stories pass it to show both versions.
   */
  sharingEnabled?: boolean;
}

/**
 * Homepage section for the installable app: two real phone screens on a
 * purple panel (a company page and, with sharing on, the notification sheet),
 * then the heading, three points and a call to action. Mirrors the clients
 * section with the visual on the left.
 */
export const MobileShowcase = ({
  sharingEnabled = documentSharingEnabled,
}: MobileShowcaseProps) => {
  const points = [
    {
      accent: "bg-play-purple",
      description:
        "Install it from your browser on a phone, tablet or desktop. No app store needed.",
      icon: DeviceMobile,
      title: "Installs like an app",
    },
    sharingEnabled
      ? {
          accent: "bg-golden-harvest",
          description:
            "New templates, shared documents and signatures show up in your notifications.",
          icon: Bell,
          title: "Know when it is signed",
        }
      : {
          accent: "bg-golden-harvest",
          description:
            "New templates and app updates show up in your notifications.",
          icon: Bell,
          title: "Stay up to date",
        },
    {
      accent: "bg-play-teal",
      description: sharingEnabled
        ? "Share a document or download its PDF straight from your phone."
        : "Download a document's PDF straight from your phone.",
      icon: PaperPlaneTilt,
      title: "Send from anywhere",
    },
  ];

  return (
    <section
      className="mobile-showcase bg-white px-5 py-24 text-nox-noir sm:px-8 lg:px-10"
      id="mobile"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="website-reveal relative aspect-8/9 overflow-hidden rounded-box bg-play-purple max-lg:order-last">
          <DevicePhone
            alt={appScreens.companyPhone.alt}
            className={cn(
              "absolute w-[41%] max-w-72",
              sharingEnabled
                ? "left-[7%] top-[17%]"
                : "left-1/2 top-[9%] -translate-x-1/2",
            )}
            height={appScreens.companyPhone.height}
            sizes="(min-width: 1024px) 18vw, 40vw"
            src={appScreens.companyPhone.src}
            tone="light"
            width={appScreens.companyPhone.width}
          />
          {sharingEnabled ? (
            <DevicePhone
              alt={appScreens.notificationsPhone.alt}
              className="absolute right-[7%] top-[7%] w-[41%] max-w-72"
              height={appScreens.notificationsPhone.height}
              sizes="(min-width: 1024px) 18vw, 40vw"
              src={appScreens.notificationsPhone.src}
              tone="light"
              width={appScreens.notificationsPhone.width}
            />
          ) : null}
        </div>

        <div>
          <SectionHeading
            description={
              sharingEnabled
                ? "Add Dokiments to your home screen and it opens like an app: check what was signed, share a document, or download the PDF between meetings."
                : "Add Dokiments to your home screen and it opens like an app: find a document, or download its PDF between meetings."
            }
            eyebrow="On your phone"
            highlight="in your pocket."
            title="Your documents, in your pocket."
          />

          <ul className="website-stagger mt-10 grid gap-6">
            {points.map((point) => (
              <ClientsShowcasePoint
                accent={point.accent}
                description={point.description}
                icon={point.icon}
                key={point.title}
                title={point.title}
              />
            ))}
          </ul>

          <div className="website-reveal mt-10">
            <LinkButton
              href="/sign-up"
              variant="primary"
            >
              Create a free account
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileShowcase;
