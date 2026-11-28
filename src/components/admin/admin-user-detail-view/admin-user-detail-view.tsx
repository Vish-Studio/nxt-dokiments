"use client";

import {
  ChatCircleTextIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
  IdentificationCardIcon,
  LockIcon,
} from "@phosphor-icons/react";
import { AdminQueryState } from "@/components/admin/admin-query-state/admin-query-state";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { roleBadgeVariants } from "@/components/admin/admin-users-view/admin-users-view";
import { Avatar } from "@/components/commons/avatar/avatar";
import { Badge } from "@/components/commons/badge/badge";
import { Button } from "@/components/commons/button/button";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { useAdminUserQuery } from "@/hooks/queries/use-admin";
import { usePageHeader } from "@/hooks/use-page-header";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import { iconSize } from "@/lib/icons";
import { planNames } from "@/lib/subscription/plan-access";
import { useToastStore } from "@/stores/toast-store";

export interface AdminUserDetailViewProps {
  /** The account to show, from the `[uid]` route segment. */
  uid: string;
}

/**
 * One account's admin page: who they are, their plan, and what they sent us.
 *
 * Real data from `GET /api/admin/users/{uid}`. The account's documents, shares
 * and devices are private to it in the rules, so the page says so instead of
 * showing numbers it cannot know. Puts the account's name in the page banner,
 * with a back arrow to Users.
 */
export const AdminUserDetailView = ({ uid }: AdminUserDetailViewProps) => {
  const user = useAdminUserQuery(uid);
  const showToast = useToastStore((state) => state.showToast);
  const account = user.data?.account;

  usePageHeader({
    back: { href: "/admin/users", label: "Users" },
    title: account?.displayName ?? "Account",
  });

  const copyUid = async () => {
    await navigator.clipboard.writeText(uid);
    showToast({ message: "UID copied.", tone: "success" });
  };

  return (
    <AdminQueryState
      errorTitle="We couldn't load this account"
      isError={user.isError}
      isPending={user.isPending}
      loadingMessage="Loading the account"
      onRetry={() => void user.refetch()}
    >
      {account ? (
        <div className="admin-user-detail-view grid gap-4">
          <section className="flex flex-wrap items-center gap-5 rounded-box bg-base-200 p-5 sm:p-6">
            <Avatar
              name={account.displayName}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-title text-2xl font-bold text-nox-noir">{account.displayName}</h2>
                <Badge variant={roleBadgeVariants[account.role]}>{planNames[account.role]}</Badge>
              </div>
              <p className="mt-1 text-sm text-nox-noir/70">
                {account.email}
                {account.companyName ? ` · ${account.companyName}` : ""}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-nox-noir/70">
                <code className="rounded-md bg-base-100 px-2 py-1 font-mono">{uid}</code>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                icon={<CopyIcon aria-hidden size={iconSize.control} weight="bold" />}
                iconPosition="left"
                onClick={() => void copyUid()}
                size="sm"
                variant="outline"
              >
                Copy UID
              </Button>
              <a
                className="btn btn-sm h-10 min-h-10 rounded-field border-transparent bg-golden-harvest px-4 font-title text-sm font-bold text-nox-noir hover:brightness-95"
                href={`mailto:${account.email}`}
              >
                <EnvelopeSimpleIcon aria-hidden size={iconSize.control} weight="bold" />
                Email account
              </a>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <SettingsCard
              icon={IdentificationCardIcon}
              title="Account"
              tone="blue"
            >
              <dl className="grid gap-2 text-sm">
                {[
                  ["Plan", planNames[account.role]],
                  ["Sign-in", account.provider === "google" ? "Google" : "Email and password"],
                  ["Joined", formatDate(account.createdAt)],
                  ["Profile updated", formatDate(account.updatedAt)],
                ].map(([term, value]) => (
                  <div
                    className="flex justify-between gap-3 rounded-field bg-base-200 px-3 py-2.5"
                    key={term}
                  >
                    <dt className="text-nox-noir/70">{term}</dt>
                    <dd className="text-right font-title font-bold text-nox-noir">{value}</dd>
                  </div>
                ))}
              </dl>
            </SettingsCard>

            <SettingsCard
              description="Documents, shares, clients and devices belong to the account and are private in the Firestore rules, so the portal can't read them."
              icon={LockIcon}
              title="Private to the account"
              tone="purple"
            >
              <p className="text-sm leading-6 text-nox-noir/70">
                To look into a document problem, ask the customer to share the document with you, or check it in the Firebase console.
              </p>
            </SettingsCard>
          </div>

          <SettingsCard
            description="Everything this account sent through the feedback form."
            icon={ChatCircleTextIcon}
            title="Feedback"
            tone="golden"
          >
            {user.data?.feedback.length ? (
              <ul className="grid gap-2">
                {user.data.feedback.map((entry) => (
                  <li
                    className="grid gap-1 rounded-box bg-base-200 p-3"
                    key={entry.id}
                  >
                    <span className="flex flex-wrap items-center gap-2 text-xs text-nox-noir/60">
                      <AdminStatusPill
                        label={entry.type === "problem" ? "Problem" : "Feedback"}
                        tone={entry.type === "problem" ? "error" : "info"}
                      />
                      <time dateTime={new Date(entry.createdAt).toISOString()}>{formatDateTime(entry.createdAt)}</time>
                      {entry.path ? <span>· {entry.path}</span> : null}
                    </span>
                    <p className="text-sm leading-6 whitespace-pre-line text-nox-noir">{entry.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-nox-noir/60">No feedback from this account.</p>
            )}
          </SettingsCard>
        </div>
      ) : null}
    </AdminQueryState>
  );
};

export default AdminUserDetailView;
