import {
  DownloadSimple,
  Eye,
  ShareNetwork,
} from "@phosphor-icons/react/dist/ssr";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { ClientsShowcasePoint } from "@/components/website/clients-showcase-point/clients-showcase-point";
import { SectionHeading } from "@/components/website/section-heading/section-heading";
import { SignShowcaseMockup } from "@/components/website/sign-showcase-mockup/sign-showcase-mockup";

const signPoints = [
  {
    accent: "bg-play-blue",
    description:
      "Send it to your client's email. They open it from the link and sign in to sign.",
    icon: ShareNetwork,
    title: "Share by email",
  },
  {
    accent: "bg-golden-harvest",
    description:
      "Every shared document shows where it stands: awaiting signature, then signed.",
    icon: Eye,
    title: "Know where it stands",
  },
  {
    accent: "bg-play-pink",
    description: "Download the signed PDF with both signatures, ready to file.",
    icon: DownloadSimple,
    title: "Keep the signed copy",
  },
];

/**
 * Homepage section for sharing and e-signing, built like "Your clients,
 * already filled in": heading, three points and a call to action on the left,
 * the mockup on the right.
 *
 * Only render it while document sharing is enabled
 * (`documentSharingEnabled`), so the site never promotes a switched-off
 * feature. The copy says recipients sign in to sign, which is how sharing
 * works (see `docs/document-sharing.md`).
 */
export const SignShowcase = () => (
  <section
    className="sign-showcase bg-white px-5 py-24 text-nox-noir sm:px-8 lg:px-10"
    id="sharing"
  >
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div>
        <SectionHeading
          description="Share any document by email. Your client opens it from the link, signs it, and you see the status change without chasing anyone."
          eyebrow="Share and e-sign"
          highlight="Get it signed."
          title="Send it. Get it signed."
        />

        <ul className="website-stagger mt-10 grid gap-6">
          {signPoints.map((point) => (
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

      <SignShowcaseMockup className="mb-10 sm:mb-0" />
    </div>
  </section>
);

export default SignShowcase;
