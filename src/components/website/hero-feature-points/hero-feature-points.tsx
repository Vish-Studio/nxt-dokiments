import {
  DeviceMobile,
  FilePdf,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

const featurePoints = [
  {
    accent: "bg-play-purple",
    icon: Sparkle,
    label: "Smart templates",
  },
  {
    accent: "bg-play-teal",
    icon: ShieldCheck,
    label: "Role access",
  },
  {
    accent: "bg-golden-harvest",
    icon: DeviceMobile,
    label: "Mobile ready",
  },
  {
    accent: "bg-play-pink",
    icon: FilePdf,
    label: "PDF export",
  },
];

export const HeroFeaturePoints = () => {
  return (
    <ul className="hero-feature-points mx-auto mt-8 grid w-fit grid-cols-2 gap-x-8 gap-y-3 lg:mx-0">
      {featurePoints.map((feature) => {
        const Icon = feature.icon;

        return (
          <li
            className="flex items-center gap-2 font-title text-sm font-semibold text-nox-noir/72"
            key={feature.label}
          >
            <span
              className={`flex size-8 items-center justify-center rounded-field ${feature.accent}`}
            >
              <Icon
                aria-hidden
                className="text-nox-noir"
                size={16}
                weight="bold"
              />
            </span>
            {feature.label}
          </li>
        );
      })}
    </ul>
  );
};
