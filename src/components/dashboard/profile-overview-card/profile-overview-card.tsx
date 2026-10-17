import { Avatar } from "@/components/commons/avatar/avatar";
import { Badge } from "@/components/commons/badge/badge";
import { planNames } from "@/lib/subscription/plan-access";
import type { AuthUser } from "@/types/auth";

export interface ProfileOverviewCardProps {
  user: AuthUser | null;
}

/**
 * The profile details that fill the sender block of a new document (see
 * `SENDER_RULES` in `prefill.ts`), so the card can say how ready the account is.
 */
const documentDetailKeys = [
  "fullName",
  "companyName",
  "businessEmail",
  "phone",
  "address",
  "brn",
] as const;

/** How the account signs in, in plain words. */
const signInMethod = (user: AuthUser) => {
  if (user.provider === "google") return "Google";
  return user.linkedGoogle ? "Email or Google" : "Email and password";
};

/**
 * The header card of Settings → My profile: who this account is, then three
 * facts at a glance — plan, how it signs in, and how many of the details that
 * fill new documents are set. Read-only; the cards below hold the editable details.
 */
export const ProfileOverviewCard = ({ user }: ProfileOverviewCardProps) => {
  const role = user?.role ?? "free";
  const filled = user
    ? documentDetailKeys.filter((key) => Boolean(user[key])).length
    : 0;
  const total = documentDetailKeys.length;

  return (
    <section className="profile-overview-card rounded-box border border-steel-mist bg-base-100 p-6">
      <div className="flex items-center gap-4">
        <Avatar
          className="bg-nox-noir text-white"
          name={user?.displayName}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-title text-xl font-bold text-nox-noir">
              {user?.displayName ?? "Your profile"}
            </p>
            <Badge variant={role}>{planNames[role]} plan</Badge>
          </div>
          <p className="mt-1 truncate text-sm text-nox-noir/60">
            {user?.email ?? "—"}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 border-t border-steel-mist pt-5 sm:grid-cols-3 sm:gap-6">
        <div>
          <dt className="text-xs font-semibold text-nox-noir/50">Plan</dt>
          <dd className="mt-1 font-title text-sm font-bold text-nox-noir">
            {planNames[role]}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-nox-noir/50">
            Signs in with
          </dt>
          <dd className="mt-1 font-title text-sm font-bold text-nox-noir">
            {user ? signInMethod(user) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-nox-noir/50">
            Document details
          </dt>
          <dd className="mt-1">
            <span className="font-title text-sm font-bold text-nox-noir">
              {filled} of {total} added
            </span>
            <div
              aria-hidden
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-200"
            >
              <div
                className="h-full rounded-full bg-nox-noir"
                style={{ width: `${(filled / total) * 100}%` }}
              />
            </div>
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default ProfileOverviewCard;
