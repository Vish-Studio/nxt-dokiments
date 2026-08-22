import {
  DeviceMobile,
  ShieldCheck,
  Sparkle,
  UsersThree,
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
    icon: UsersThree,
    label: "Team friendly",
  },
];

export const HeroFeaturePoints = () => {
  return (
    <div className="hero-feature-points mt-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {featurePoints.map((feature) => {
          const Icon = feature.icon;

          return (
            <div className="flex flex-col items-center gap-2 text-center" key={feature.label}>
              <span className={`flex size-14 items-center justify-center rounded-box ${feature.accent}`}>
                <Icon aria-hidden size={22} weight="bold" />
              </span>
              <span className="font-title text-[10px] font-bold uppercase tracking-wide text-nox-noir">
                {feature.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
