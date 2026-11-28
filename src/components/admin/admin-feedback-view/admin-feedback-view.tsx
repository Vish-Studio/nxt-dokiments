"use client";

import { ChatCircleTextIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminQueryState } from "@/components/admin/admin-query-state/admin-query-state";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { Avatar } from "@/components/commons/avatar/avatar";
import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { useAdminFeedbackQuery } from "@/hooks/queries/use-admin";
import { formatCount, formatDateTime, pluralise } from "@/lib/admin/format";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { FeedbackEntry, FeedbackType } from "@/types/feedback";

const typeLabels: Record<FeedbackType, string> = { feedback: "Feedback", problem: "Problem" };

/**
 * The admin Feedback inbox: every message sent from the app's feedback form,
 * with type tabs and search, and the selected message beside the list.
 *
 * Real data from `GET /api/admin/feedback`. Feedback is append-only, so there
 * is no status to change; replying opens the administrator's email app,
 * addressed to the sender, because the app has no outbound support inbox.
 */
export const AdminFeedbackView = () => {
  const feedback = useAdminFeedbackQuery();
  const [type, setType] = useState<FeedbackType | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const entries = useMemo(() => feedback.data ?? [], [feedback.data]);
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return entries.filter(
      (entry) =>
        (type === "all" || entry.type === type) &&
        (!query || [entry.message, entry.email, entry.displayName].some((value) => value.toLowerCase().includes(query))),
    );
  }, [entries, search, type]);

  // Falls back to the first visible message, so changing a filter never leaves an empty reading pane.
  const selected: FeedbackEntry | undefined = visible.find((entry) => entry.id === selectedId) ?? visible[0];

  return (
    <AdminQueryState
      errorTitle="We couldn't load feedback"
      isError={feedback.isError}
      isPending={feedback.isPending}
      loadingMessage="Loading feedback"
      onRetry={() => void feedback.refetch()}
    >
      <div className="admin-feedback-view grid gap-2">
        <TabMenu
          ariaLabel="Filter feedback by type"
          className="mb-2 self-start"
          items={[
            { badge: formatCount(entries.length), id: "all", label: "All" },
            { badge: formatCount(entries.filter((entry) => entry.type === "problem").length), id: "problem", label: "Problems" },
            { badge: formatCount(entries.filter((entry) => entry.type === "feedback").length), id: "feedback", label: "Feedback" },
          ]}
          onChange={(id) => setType(id as FeedbackType | "all")}
          value={type}
        />

        <CollectionToolbar
          appearance="compact"
          ariaLabel="Search feedback"
          canReset={Boolean(search)}
          onReset={() => setSearch("")}
          onSearch={setSearch}
          onSort={() => undefined}
          resultLabel={pluralise(visible.length, "message")}
          search={search}
          searchLabel="Search feedback"
          searchPlaceholder="Search messages, names or emails"
          sort="newest"
          sortOptions={[{ label: "Newest first", value: "newest" }]}
        />

        {visible.length === 0 || !selected ? (
          <EmptyState
            description={entries.length === 0 ? "Messages from the app's feedback form will appear here." : "Try another word, or another tab."}
            icon={<ChatCircleTextIcon aria-hidden size={iconSize.feature} weight="bold" />}
            title={entries.length === 0 ? "No feedback yet" : "No matching messages"}
          />
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
            <ul
              aria-label="Messages"
              className="overflow-hidden rounded-box border border-steel-mist bg-base-100"
            >
              {visible.map((entry) => (
                <li
                  className="border-t border-steel-mist/70 first:border-t-0"
                  key={entry.id}
                >
                  <button
                    aria-current={entry.id === selected.id ? "true" : undefined}
                    className={cn(
                      "grid w-full gap-1 p-4 text-left transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nox-noir",
                      entry.id === selected.id && "bg-base-200",
                    )}
                    onClick={() => setSelectedId(entry.id)}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <b className="truncate font-title text-sm">{entry.displayName}</b>
                      <time
                        className="shrink-0 text-xs text-nox-noir/60"
                        dateTime={new Date(entry.createdAt).toISOString()}
                      >
                        {formatDateTime(entry.createdAt)}
                      </time>
                    </span>
                    <span className="line-clamp-2 text-sm text-nox-noir/75">{entry.message}</span>
                    <AdminStatusPill
                      label={typeLabels[entry.type]}
                      tone={entry.type === "problem" ? "error" : "info"}
                    />
                  </button>
                </li>
              ))}
            </ul>

            <article className="grid gap-4 rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6 lg:sticky lg:top-24">
              <header className="flex flex-wrap items-center gap-3">
                <Avatar
                  name={selected.displayName}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-title text-lg font-bold">{selected.displayName}</h2>
                  <Link
                    className="text-sm text-nox-noir/70 underline-offset-4 hover:underline"
                    href={`/admin/users/${selected.uid}`}
                  >
                    {selected.email} · View account
                  </Link>
                </div>
                <AdminStatusPill
                  label={typeLabels[selected.type]}
                  tone={selected.type === "problem" ? "error" : "info"}
                />
              </header>
              <p className="text-xs text-nox-noir/60">
                Sent {formatDateTime(selected.createdAt)}
                {selected.path ? ` from ${selected.path}` : ""}
              </p>
              <p className="text-base leading-7 whitespace-pre-line text-nox-noir">{selected.message}</p>
              <a
                className="btn h-11 min-h-11 w-fit rounded-field border-transparent bg-golden-harvest px-5 font-title text-sm font-bold text-nox-noir hover:brightness-95"
                href={`mailto:${selected.email}?subject=${encodeURIComponent("Your feedback to Dokiments")}`}
              >
                <EnvelopeSimpleIcon
                  aria-hidden
                  size={iconSize.control}
                  weight="bold"
                />
                Reply by email
              </a>
            </article>
          </div>
        )}
      </div>
    </AdminQueryState>
  );
};

export default AdminFeedbackView;
