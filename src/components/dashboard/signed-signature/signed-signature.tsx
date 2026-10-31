import type { ShareSignature } from "@/types/sharing";

export interface SignedSignatureProps {
  signature: ShareSignature;
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  year: "numeric",
});

/** A recipient's typed signature in the script font, with who signed and when. */
export const SignedSignature = ({ signature }: SignedSignatureProps) => {
  const signedAt = new Date(signature.signedAt);

  return (
    <div className="signed-signature">
      <p className="border-b-2 border-nox-noir/40 px-2 py-1 font-signature text-3xl wrap-break-word text-nox-noir">
        {signature.value}
      </p>
      <p className="mt-1 text-xs text-nox-noir/55">
        Signed by {signature.email} on{" "}
        <time dateTime={signedAt.toISOString()}>
          {dateTimeFormatter.format(signedAt)}
        </time>
      </p>
    </div>
  );
};
