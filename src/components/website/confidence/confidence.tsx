import {
  ArrowRight,
  DeviceMobile,
  FilePdf,
  FilePlus,
  FolderSimpleStar,
  ShieldCheck,
  Storefront,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

import { BentoCell } from "@/components/website/bento-cell/bento-cell";
import { SectionHeading } from "@/components/website/section-heading/section-heading";

const workflowChips = [
  { icon: Storefront, label: "Marketplace" },
  { icon: FolderSimpleStar, label: "My Templates" },
  { icon: FilePlus, label: "Documents" },
];

export const Confidence = () => {
  return (
    <section className="confidence bg-base-200 px-5 py-24 text-nox-noir sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          align="center"
          highlight="Keep everything."
          title="Sign in once. Keep everything."
        />

        <div className="website-stagger mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <BentoCell
            accent="bg-golden-harvest"
            className="md:col-span-2"
            description="Templates move from marketplace preview to saved library to finished document without changing context."
            featured
            icon={ArrowRight}
            title="One continuous workflow"
          >
            <ul className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {workflowChips.map((chip, index) => {
                const ChipIcon = chip.icon;

                return (
                  <li
                    className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3"
                    key={chip.label}
                  >
                    {index > 0 ? (
                      <ArrowRight
                        aria-hidden
                        className="ml-4 rotate-90 sm:ml-0 sm:rotate-0"
                        size={18}
                        weight="bold"
                      />
                    ) : null}
                    <span className="flex items-center gap-2 rounded-field bg-white px-4 py-3 font-title text-sm font-bold">
                      <ChipIcon
                        aria-hidden
                        size={20}
                        weight="bold"
                      />
                      {chip.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </BentoCell>

          <BentoCell
            accent="bg-play-blue"
            description="Your plan decides which template styles you can use and how many you can save, so everything stays in step with your account."
            icon={ShieldCheck}
            title="Access follows the account"
          />

          <BentoCell
            accent="bg-play-pink"
            description="Finish a document and download it as a PDF, ready to send to your client."
            icon={FilePdf}
            title="Export as a PDF"
          />

          <BentoCell
            accent="bg-play-teal"
            description="Save client details once, then pick them when you create a document."
            icon={UsersThree}
            title="Clients close at hand"
          />

          <BentoCell
            accent="bg-play-purple"
            description="Add Dokiments to your home screen and use the same workspace on desktop, tablet, or mobile."
            icon={DeviceMobile}
            title="Installs like an app"
          />
        </div>
      </div>
    </section>
  );
};
