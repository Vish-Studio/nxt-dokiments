import { MAX_SIGNATURE_LENGTH } from "@/lib/sharing/signature-schema";

export interface SignatureFieldProps {
  /** Disables typing, e.g. while the signature is being submitted. */
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
}

/**
 * Where a recipient types their signature. The text is shown live in the
 * signature script font, so what they type is what the document will carry.
 */
export const SignatureField = ({
  disabled = false,
  onChange,
  value,
}: SignatureFieldProps) => (
  <div className="signature-field">
    <input
      aria-label="Type your full name to sign"
      autoComplete="off"
      className="w-full border-0 border-b-2 border-nox-noir/40 bg-golden-harvest/10 px-2 py-1 font-signature text-3xl text-nox-noir placeholder:font-body placeholder:text-sm placeholder:text-nox-noir/40 focus:border-nox-noir focus:outline-none disabled:opacity-60"
      disabled={disabled}
      maxLength={MAX_SIGNATURE_LENGTH}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Type your full name to sign"
      type="text"
      value={value}
    />
    <p className="mt-1 text-xs text-nox-noir/50">
      Typing your name here is your electronic signature.
    </p>
  </div>
);
