import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

import { NotificationListItem } from "@/components/dashboard/notification-list-item/notification-list-item";
import { ShareStatusBadge } from "@/components/dashboard/share-status-badge/share-status-badge";
import { ShareTimeline } from "@/components/dashboard/share-timeline/share-timeline";
import { SignedSignature } from "@/components/dashboard/signed-signature/signed-signature";
import { SignSharePreview } from "@/components/website/sign-showcase-mockup/sign-share-preview";
import { cn } from "@/lib/utils";

/**
 * Fixed UTC times so every render (server, browser, story) shows the same
 * timeline. Rendered as a server component, the dates are formatted once.
 */
const SHARED_AT = Date.UTC(2026, 5, 18, 9, 12);
const VIEWED_AT = Date.UTC(2026, 5, 18, 9, 40);
const SIGNED_AT = Date.UTC(2026, 5, 18, 10, 5);
const SIGNER = "maya@northline.com";

export interface SignShowcaseMockupProps {
  className?: string;
}

/**
 * Illustrative only: a document going from the share dialog to signed. The
 * share step is a still of the dialog; the result is the app's own status
 * badge, audit trail, signature and "signed" notification. Laid out like the
 * clients mockup (pastel panel, white cards, a black arrow between them).
 */
export const SignShowcaseMockup = ({ className }: SignShowcaseMockupProps) => (
  <div
    aria-hidden
    className={cn(
      "sign-showcase-mockup website-reveal relative grid gap-3 rounded-box bg-play-blue p-6 sm:p-10",
      className,
    )}
    inert
  >
    <SignSharePreview />

    <div className="flex justify-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-nox-noir text-white">
        <ArrowDown
          size={16}
          weight="bold"
        />
      </span>
    </div>

    <div className="rounded-box border border-nox-noir/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3 border-b border-steel-mist pb-3">
        <p className="font-title text-base font-bold text-nox-noir">
          Design services contract
        </p>
        <ShareStatusBadge
          signable
          status="signed"
        />
      </div>
      <div className="mt-4">
        <ShareTimeline
          events={[
            { at: SHARED_AT, email: SIGNER, kind: "shared" },
            { at: VIEWED_AT, email: SIGNER, kind: "viewed" },
            { at: SIGNED_AT, email: SIGNER, kind: "signed" },
          ]}
        />
      </div>
      <div className="mt-4 rounded-field bg-base-200 px-4 py-3">
        <SignedSignature
          signature={{
            email: SIGNER,
            signedAt: SIGNED_AT,
            type: "typed",
            value: "Maya Chen",
          }}
        />
      </div>
    </div>

    <ul className="website-float absolute -bottom-10 -right-6 hidden w-80 rounded-box border border-steel-mist/70 bg-base-100 p-1.5 shadow-soft sm:block">
      <NotificationListItem
        notification={{
          action: { href: "/sign-up", label: "View shared copy" },
          body: "Design services contract",
          createdAt: SIGNED_AT,
          id: "document-signed:showcase",
          kind: "document-signed",
          read: false,
          title: `${SIGNER} signed a document`,
        }}
        now={SIGNED_AT}
      />
    </ul>
  </div>
);

export default SignShowcaseMockup;
