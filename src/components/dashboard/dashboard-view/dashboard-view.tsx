"use client";

import {
  ArrowRightIcon,
  CheckCircleIcon,
  CreditCardIcon,
  FileTextIcon,
  LayoutIcon,
  SparkleIcon,
  StorefrontIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/commons/badge/badge";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { useClientsQuery } from "@/hooks/queries/use-clients";
import { useDocumentsQuery } from "@/hooks/queries/use-documents";
import { useSavedTemplatesQuery } from "@/hooks/queries/use-saved-templates";
import { getSavedTemplateLimit } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/auth";
import type { MarketplaceTemplate } from "@/types/template";

const roleLabels: Record<UserRole, string> = {
  free: "Free",
  gold: "Gold",
  silver: "Silver",
  special: "Special",
  superadmin: "Super admin",
};

const roleBadgeVariants: Record<
  UserRole,
  "free" | "gold" | "silver" | "special" | "superadmin"
> = {
  free: "free",
  gold: "gold",
  silver: "silver",
  special: "special",
  superadmin: "superadmin",
};

export const DashboardView = () => {
  const user = useAuthStore((state) => state.user);
  const { data: clients = [], isLoading: isClientsLoading } = useClientsQuery();
  const { data: saved = [], isLoading: isSavedLoading } =
    useSavedTemplatesQuery();
  const limit = getSavedTemplateLimit(user?.role);
  const { data: documents = [], isLoading: isDocumentsLoading } =
    useDocumentsQuery();
  const isLoading = isSavedLoading || isDocumentsLoading || isClientsLoading;
  const [previewTemplate, setPreviewTemplate] =
    useState<MarketplaceTemplate | null>(null);

  const isFree = !user || user.role === "free";
  const firstName = (user?.displayName ?? "there").split(" ")[0];
  const roleLabel = user ? roleLabels[user.role] : "Free";
  const remainingTemplateSlots = isFree
    ? Math.max(limit - saved.length, 0)
    : null;
  const documentLabel = documents.length === 1 ? "document" : "documents";
  const templateLabel = saved.length === 1 ? "template" : "templates";
  const clientLabel = clients.length === 1 ? "client" : "clients";

  const snapshotItems = [
    {
      icon: FileTextIcon,
      label: "Documents",
      tone: "bg-play-purple",
      value: `${documents.length} ${documentLabel}`,
    },
    {
      icon: LayoutIcon,
      label: "Saved templates",
      tone: "bg-play-pink",
      value: `${saved.length} ${templateLabel}`,
    },
    {
      icon: UsersThreeIcon,
      label: "Clients",
      tone: "bg-play-teal",
      value: `${clients.length} ${clientLabel}`,
    },
    {
      icon: CreditCardIcon,
      label: "Plan",
      tone: "bg-golden-harvest",
      value: roleLabel,
    },
  ];

  const quickActions = [
    {
      color: "bg-play-purple hover:bg-play-purple/80",
      href: "/documents",
      icon: FileTextIcon,
      label: "Open documents",
    },
    {
      href: "/my-templates",
      icon: LayoutIcon,
      color: "bg-play-pink hover:bg-play-pink/70",
      label: "My templates",
    },
    {
      href: "/marketplace",
      icon: StorefrontIcon,
      color: "bg-play-teal hover:brightness-95",
      label: "Browse marketplace",
    },
  ];

  const recentDocuments = [...documents]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 4);
  const latestDocument = recentDocuments[0] ?? null;
  const latestTemplate = saved.at(-1)?.template ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-box bg-golden-harvest p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 font-title text-xs font-bold uppercase tracking-normal text-nox-noir">
            <SparkleIcon
              aria-hidden
              size={14}
              weight="fill"
            />
            Workspace overview
          </span>
          <h1 className="mt-5 font-title text-3xl font-bold leading-tight text-nox-noir sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-nox-noir/70">
            Keep the documents your business repeats most in one place. Save a
            template once, create polished files quickly, and return to recent
            client work without searching.
          </p>
        </div>

        <aside className="hidden rounded-box bg-nox-noir p-6 text-white lg:block">
          <p className="font-title text-sm font-bold uppercase tracking-normal text-white/50">
            Marketplace focus
          </p>
          <h2 className="mt-3 font-title text-2xl font-bold">
            Business essentials
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Prioritize contracts, proposals, invoices, quotations, and receipts
            for repeatable SME workflows.
          </p>
          <Link
            className="group btn mt-5 min-h-11 h-11 w-full border-0 bg-golden-harvest font-title font-semibold tracking-normal text-nox-noir hover:brightness-95"
            href="/marketplace"
          >
            Explore templates
            <ArrowRightIcon
              aria-hidden
              className="arrow-cta-icon"
              size={18}
              weight="bold"
            />
          </Link>
        </aside>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-title text-xl font-bold text-nox-noir">
                Workspace snapshot
              </h2>
              <p className="mt-1 text-sm leading-6 text-nox-noir/60">
                The numbers that matter before starting the next document.
              </p>
            </div>
            <Badge
              className="shrink-0"
              variant={user ? roleBadgeVariants[user.role] : "free"}
            >
              {roleLabel} plan
            </Badge>
          </div>

          <div className="mt-5 grid gap-3">
            {isLoading ? (
              <LoadingStatus message="Loading workspace snapshot…" />
            ) : null}
            {snapshotItems.map((item) => {
              const SnapshotIcon = item.icon;
              const isCountItem = item.label !== "Plan";

              return (
                <div
                  className="flex items-center justify-between gap-4 rounded-box bg-base-200 p-3"
                  key={item.label}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-box text-nox-noir ${item.tone}`}
                    >
                      <SnapshotIcon
                        aria-hidden
                        size={19}
                        weight="bold"
                      />
                    </span>
                    <p className="truncate text-sm text-nox-noir/60">
                      {item.label}
                    </p>
                  </div>
                  {isLoading && isCountItem ? (
                    <div
                      aria-hidden
                      className="skeleton h-5 w-16 shrink-0 rounded-field"
                    />
                  ) : (
                    <p className="shrink-0 font-title text-base font-bold text-nox-noir">
                      {item.value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!isLoading && remainingTemplateSlots !== null ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-nox-noir/60">
              <CheckCircleIcon
                aria-hidden
                className="text-success"
                size={17}
                weight="fill"
              />
              {remainingTemplateSlots} free template{" "}
              {remainingTemplateSlots === 1 ? "slot" : "slots"} left.
            </p>
          ) : null}
        </div>

        <div className="rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-title text-xl font-bold text-nox-noir">
                Continue work
              </h2>
              <p className="mt-1 text-sm leading-6 text-nox-noir/60">
                Resume a document or jump straight into the template library.
              </p>
            </div>
            <Link
              className="font-title text-sm font-bold text-nox-noir hover:underline"
              href="/documents"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-5 rounded-box border border-dashed border-steel-mist bg-base-100 p-5">
              <LoadingStatus message="Loading recent activity…" />
              <div aria-hidden>
                <div className="skeleton h-3 w-24 rounded-field" />
                <div className="skeleton mt-3 h-6 w-2/3 rounded-field" />
                <div className="skeleton mt-3 h-11 w-40 rounded-box" />
              </div>
            </div>
          ) : latestDocument ? (
            <div className="mt-5 rounded-box bg-play-blue/35 p-4">
              <p className="font-title text-xs font-bold uppercase tracking-normal text-nox-noir/50">
                Latest document
              </p>
              <h3 className="mt-2 font-title text-2xl font-bold text-nox-noir">
                {latestDocument.name}
              </h3>
              <p className="mt-1 text-sm text-nox-noir/60">
                {latestDocument.templateSnapshot?.name ?? "Document template"}
              </p>
              <Link
                className="group btn btn-primary mt-5 min-h-11 h-11 font-title font-semibold tracking-normal"
                href="/documents"
              >
                Open document
                <ArrowRightIcon
                  aria-hidden
                  className="arrow-cta-icon"
                  size={18}
                  weight="bold"
                />
              </Link>
            </div>
          ) : latestTemplate ? (
            <div className="mt-5 flex flex-col gap-5 rounded-box bg-play-pink/45 p-4 sm:flex-row sm:items-center">
              <TemplateCard
                className="mx-0 w-36 sm:w-40"
                onPreview={() => setPreviewTemplate(latestTemplate)}
                saved
                template={latestTemplate}
              />
              <div className="min-w-0">
                <p className="font-title text-xs font-bold uppercase tracking-normal text-nox-noir/50">
                  Ready template
                </p>
                <h3 className="mt-2 font-title text-2xl font-bold text-nox-noir">
                  {latestTemplate.name}
                </h3>
                <p className="mt-1 text-sm leading-6 text-nox-noir/60">
                  Use your latest saved template to create a filled document.
                </p>
                <Link
                  className="group btn btn-primary mt-4 min-h-11 h-11 font-title font-semibold tracking-normal"
                  href={`/documents?template=${latestTemplate.id}`}
                >
                  Use template
                  <ArrowRightIcon
                    aria-hidden
                    className="arrow-cta-icon"
                    size={18}
                    weight="bold"
                  />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-box border border-dashed border-steel-mist bg-base-100 p-5">
              <p className="font-title text-lg font-bold text-nox-noir">
                No work started yet
              </p>
              <p className="mt-1 text-sm leading-6 text-nox-noir/60">
                Save a business template first, then create your first document.
              </p>
              <Link
                className="group btn btn-primary mt-5 min-h-11 h-11 font-title font-semibold tracking-normal"
                href="/marketplace"
              >
                Browse marketplace
                <ArrowRightIcon
                  aria-hidden
                  className="arrow-cta-icon"
                  size={18}
                  weight="bold"
                />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-title text-xl font-bold text-nox-noir">
              Quick paths
            </h2>
            <p className="mt-1 text-sm text-nox-noir/60">
              Three places most users need from the dashboard.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Link
                className={`group flex items-center justify-between gap-3 rounded-box p-4 text-nox-noir transition ${action.color}`}
                href={action.href}
                key={action.label}
              >
                <span className="flex items-center gap-3 font-title text-sm font-bold">
                  <ActionIcon
                    aria-hidden
                    size={19}
                    weight="bold"
                  />
                  {action.label}
                </span>
                <ArrowRightIcon
                  aria-hidden
                  className="arrow-cta-icon"
                  size={17}
                  weight="bold"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {recentDocuments.length > 1 ? (
        <section className="rounded-box border border-steel-mist bg-base-100 p-5 sm:p-6">
          <h2 className="font-title text-xl font-bold text-nox-noir">
            Recent documents
          </h2>
          <div className="mt-4 divide-y divide-steel-mist">
            {recentDocuments.slice(0, 3).map((document) => (
              <Link
                className="group flex items-center justify-between gap-4 py-3 transition hover:text-nox-noir/70"
                href="/documents"
                key={document.id}
              >
                <div className="min-w-0">
                  <h4 className="truncate font-title text-sm font-bold text-nox-noir">
                    {document.name}
                  </h4>
                  <p className="truncate text-xs text-nox-noir/55">
                    {document.templateSnapshot?.name ?? "Document template"}
                  </p>
                </div>
                <ArrowRightIcon
                  aria-hidden
                  className="arrow-cta-icon shrink-0 text-nox-noir/40"
                  size={17}
                  weight="bold"
                />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <TemplatePreviewDialog
        mode="library"
        onClose={() => setPreviewTemplate(null)}
        onPrint={() => window.print()}
        saved
        template={previewTemplate}
        tone="golden"
        useHref={
          previewTemplate
            ? `/documents?template=${previewTemplate.id}`
            : "/documents"
        }
      />
    </div>
  );
};
