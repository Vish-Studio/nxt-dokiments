import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";

/**
 * A still of the real share dialog, mid-share: the recipient typed in, the
 * matching saved client offered below, Cancel and Share. Built with the
 * dialog's own `Input`, `Button` and classes; the live `ShareDialog` cannot be
 * used here because it calls the share API.
 */
export const SignSharePreview = () => (
  <div className="sign-share-preview w-full rounded-box border border-steel-mist bg-base-100 p-6">
    <h3 className="font-title text-lg font-bold text-nox-noir">
      Share this document
    </h3>
    <p className="mt-2 text-sm leading-6 text-nox-noir/65">
      Send{" "}
      <span className="font-semibold text-nox-noir">
        Design services contract
      </span>{" "}
      to someone who needs to view and sign it.
    </p>

    <div className="mt-5">
      <Input
        className="border-nox-noir bg-base-100 ring-2 ring-nox-noir/15"
        defaultValue="maya@northline.com"
        id="sign-share-preview-email"
        label="Recipient email"
        readOnly
        tabIndex={-1}
        type="email"
      />
      <div className="mt-3">
        <p className="font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45">
          Your clients
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          <li className="max-w-full truncate rounded-field border border-nox-noir bg-nox-noir px-3 py-1.5 text-sm text-white">
            <span className="mr-1.5 font-semibold">Maya Chen</span>
            <span className="opacity-70">maya@northline.com</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="mt-6 flex justify-end gap-2">
      <Button
        size="sm"
        tabIndex={-1}
        type="button"
        variant="ghost"
      >
        Cancel
      </Button>
      <Button
        size="sm"
        tabIndex={-1}
        type="button"
      >
        Share
      </Button>
    </div>
  </div>
);

export default SignSharePreview;
