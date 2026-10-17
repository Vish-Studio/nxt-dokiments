import {
  AddressBook,
  Lightning,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { ClientsShowcaseMockup } from "@/components/website/clients-showcase-mockup/clients-showcase-mockup";
import { ClientsShowcasePoint } from "@/components/website/clients-showcase-point/clients-showcase-point";
import { SectionHeading } from "@/components/website/section-heading/section-heading";

const clientPoints = [
  {
    accent: "bg-play-blue",
    description:
      "Keep each client's name, phone, email, address, and BRN in My Clients, ready for the next document.",
    icon: AddressBook,
    title: "Save a client once",
  },
  {
    accent: "bg-golden-harvest",
    description:
      "Pick the client while creating a document and their details fill the recipient section for you.",
    icon: Lightning,
    title: "Prefill in one click",
  },
  {
    accent: "bg-play-pink",
    description:
      "Export a polished PDF that already carries the right contact details, ready to send to your client.",
    icon: PaperPlaneTilt,
    title: "Send it without retyping",
  },
];

export const ClientsShowcase = () => {
  return (
    <section
      className="clients-showcase  px-5 py-24 text-nox-noir sm:px-8 lg:px-10"
      id="clients"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            description="Repeat clients should not mean repeat typing. Add them to your workspace once and every invoice, quotation, or contract starts already addressed."
            eyebrow="My Clients"
            highlight="already filled in."
            title="Your clients, already filled in."
          />

          <ul className="website-stagger mt-10 grid gap-6">
            {clientPoints.map((point) => (
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
              Add your first client
            </LinkButton>
          </div>
        </div>

        <ClientsShowcaseMockup />
      </div>
    </section>
  );
};

export default ClientsShowcase;
