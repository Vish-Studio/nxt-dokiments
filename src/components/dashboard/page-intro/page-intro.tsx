export type PageIntroProps = {
  description?: string;
  title?: string;
};

export const PageIntro = ({ description, title }: PageIntroProps) => {
  return (
    <div className="px-5 pt-5 sm:px-8 sm:pt-8 lg:px-10">
      <h2 className="font-title text-3xl font-bold leading-tight text-nox-noir sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-base text-nox-noir/65">{description}</p>
      ) : null}
    </div>
  );
};
