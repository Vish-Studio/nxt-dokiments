"use client";

import {
  ArrowRightIcon,
  CreditCardIcon,
  FileTextIcon,
  LayoutIcon,
  PlusIcon,
  SparkleIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { DashboardDestinationCard } from "@/components/dashboard/dashboard-destination-card/dashboard-destination-card";
import { TemplateCard } from "@/components/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/template-preview-dialog/template-preview-dialog";
import { TemplateThumbnail } from "@/components/template-thumbnail/template-thumbnail";
import { getTemplateById, marketplaceTemplates } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import { useUserDocuments } from "@/stores/documents-store";
import { useTemplateLibrary } from "@/stores/templates-store";
import type { UserRole } from "@/types/auth";
import type { MarketplaceTemplate } from "@/types/template";

const roleLabels: Record<UserRole, string> = {
  free: "Free",
  gold: "Gold",
  silver: "Silver",
  special: "Special",
  superadmin: "Super admin",
};

export const DashboardView = () => {
  const user = useAuthStore((state) => state.user);
  const { limit, saved } = useTemplateLibrary();
  const documents = useUserDocuments(user?.uid);
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null);

  const isFree = !user || user.role === "free";
  const firstName = (user?.displayName ?? "there").split(" ")[0];
  const roleLabel = user ? roleLabels[user.role] : "Free";
  const remainingTemplateSlots = isFree ? Math.max(limit - saved.length, 0) : null;
  const documentLabel = documents.length === 1 ? "document" : "documents";
  const templateLabel = saved.length === 1 ? "template" : "templates";

  const destinationCards = [
    {
      description: "Create, edit, and export client-ready documents from your saved templates.",
      href: "/documents",
      icon: FileTextIcon,
      label: "Documents",
      metric: `${documents.length} ${documentLabel}`,
      tone: "blue" as const,
    },
    {
      description: "Manage the reusable templates you have already saved for future client work.",
      href: "/my-templates",
      icon: LayoutIcon,
      label: "My Templates",
      metric: isFree ? `${saved.length} of ${limit} saved` : `${saved.length} saved`,
      tone: "pink" as const,
    },
    {
      description: "Browse contracts, invoices, proposals, quotations, and more business templates.",
      href: "/marketplace",
      icon: StorefrontIcon,
      label: "Marketplace",
      metric: `${marketplaceTemplates.length} templates`,
      tone: "golden" as const,
    },
    {
      description: "Manage access to premium document styles and higher template limits.",
      href: "/subscription",
      icon: CreditCardIcon,
      label: "Current plan",
      metric: roleLabel,
      tone: "purple" as const,
    },
  ];

  const recentDocuments = [...documents].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
  const recentTemplates = saved.slice(-4).reverse();
  const nextStep =
    saved.length === 0
      ? {
          description:
            "Start by saving one reusable business template. It will appear in My Templates and become available for document creation.",
          href: "/marketplace",
          label: "Browse marketplace",
        }
      : documents.length === 0
        ? {
            description:
              "You already have saved templates. Create your first document and keep the filled copy in Documents.",
            href: "/documents",
            label: "Create document",
          }
        : {
            description:
              "Your workspace is active. Review the newest document or browse the marketplace for a better-fit template.",
            href: "/documents",
            label: "Continue work",
          };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-box bg-golden-harvest p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 font-title text-xs font-bold uppercase tracking-normal text-nox-noir">
            <SparkleIcon aria-hidden size={14} weight="fill" />
            Workspace overview
          </span>
          <h1 className="mt-5 font-title text-3xl font-bold leading-tight text-nox-noir sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-nox-noir/70">
            Keep the documents your business repeats most in one place. Save a template once,
            create polished files quickly, and return to recent client work without searching.
          </p>
        </div>

        <aside className="rounded-box border border-steel-mist bg-base-100 p-6">
          <p className="font-title text-sm font-bold uppercase tracking-normal text-nox-noir/45">
            Recommended next step
          </p>
          <h2 className="mt-3 font-title text-2xl font-bold text-nox-noir">{nextStep.label}</h2>
          <p className="mt-2 text-sm leading-6 text-nox-noir/65">{nextStep.description}</p>
          <Link
            className="btn btn-primary mt-5 min-h-11 h-11 w-full font-title font-semibold tracking-normal"
            href={nextStep.href}
          >
            {nextStep.label}
            <ArrowRightIcon aria-hidden size={18} weight="bold" />
          </Link>
        </aside>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {destinationCards.map((card) => (
          <DashboardDestinationCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-box border border-steel-mist bg-base-100 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-title text-xl font-bold text-nox-noir">Workspace health</h2>
              <p className="mt-1 text-sm text-nox-noir/60">
                A quick read on what is ready to use and what needs attention.
              </p>
            </div>
            <span className="rounded-full bg-base-200 px-3 py-1 font-title text-xs font-bold uppercase tracking-normal text-nox-noir/60">
              {roleLabel} plan
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-box bg-base-200 p-4">
              <p className="text-sm text-nox-noir/55">Saved library</p>
              <p className="mt-2 font-title text-2xl font-bold text-nox-noir">
                {saved.length} {templateLabel}
              </p>
            </div>
            <div className="rounded-box bg-play-blue/35 p-4">
              <p className="text-sm text-nox-noir/55">Documents created</p>
              <p className="mt-2 font-title text-2xl font-bold text-nox-noir">
                {documents.length} {documentLabel}
              </p>
            </div>
            <div className="rounded-box bg-play-pink/45 p-4">
              <p className="text-sm text-nox-noir/55">Free plan capacity</p>
              <p className="mt-2 font-title text-2xl font-bold text-nox-noir">
                {remainingTemplateSlots === null ? "Unlimited" : `${remainingTemplateSlots} left`}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-box bg-nox-noir p-6 text-white">
          <p className="font-title text-sm font-bold uppercase tracking-normal text-white/50">
            Marketplace focus
          </p>
          <h2 className="mt-3 font-title text-2xl font-bold">Business essentials</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Prioritize contracts, proposals, invoices, quotations, and receipts for repeatable SME
            workflows.
          </p>
          <Link
            className="btn mt-5 min-h-11 h-11 w-full border-0 bg-golden-harvest font-title font-semibold tracking-normal text-nox-noir hover:brightness-95"
            href="/marketplace"
          >
            Explore templates
            <ArrowRightIcon aria-hidden size={18} weight="bold" />
          </Link>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <h1 className="font-title text-2xl font-medium text-nox-noir sm:text-3xl">
          Recent activity
        </h1>
      </div>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-title text-base font-bold text-nox-noir">Recent documents</h3>
          {documents.length > 0 ? (
            <Link
              className="font-title text-sm font-semibold text-nox-noir hover:underline"
              href="/documents"
            >
              View all
            </Link>
          ) : null}
        </div>

        {recentDocuments.length === 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-box border border-dashed border-steel-mist bg-base-100 p-6">
            <p className="text-sm text-nox-noir/60">You haven&apos;t created any documents yet.</p>
            <Link
              className="btn btn-sm btn-primary font-title font-semibold tracking-normal"
              href="/documents"
            >
              <PlusIcon aria-hidden size={16} weight="bold" />
              New document
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDocuments.map((document) => {
              const template = getTemplateById(document.templateId);

              if (!template) {
                return null;
              }

              return (
                <Link
                  className="flex flex-col rounded-box border border-steel-mist bg-base-100 p-3 transition-colors hover:bg-base-200"
                  href="/documents"
                  key={document.id}
                >
                  <TemplateThumbnail template={template} values={document.values} />
                  <div className="mt-3 min-w-0">
                    <h4 className="truncate font-title text-sm font-bold text-nox-noir">
                      {document.name}
                    </h4>
                    <p className="truncate text-xs text-nox-noir/55">
                      {template.name} · {template.style.name}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-title text-base font-bold text-nox-noir">Your templates</h3>
          {saved.length > 0 ? (
            <Link
              className="font-title text-sm font-semibold text-nox-noir hover:underline"
              href="/my-templates"
            >
              View all
            </Link>
          ) : null}
        </div>

        {recentTemplates.length === 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-box border border-dashed border-steel-mist bg-base-100 p-6">
            <p className="text-sm text-nox-noir/60">
              Save templates from the marketplace to reuse them in your documents.
            </p>
            <Link
              className="btn btn-sm btn-primary font-title font-semibold tracking-normal"
              href="/marketplace"
            >
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentTemplates.map((item) => {
              const template = getTemplateById(item.templateId);

              if (!template) {
                return null;
              }

              return (
                <TemplateCard
                  key={item.savedId}
                  onPreview={() => setPreviewTemplate(template)}
                  saved
                  template={template}
                />
              );
            })}
          </div>
        )}
      </section>

      <TemplatePreviewDialog
        mode="library"
        onClose={() => setPreviewTemplate(null)}
        onPrint={() => window.print()}
        saved
        template={previewTemplate}
        useHref={previewTemplate ? `/documents?template=${previewTemplate.id}` : "/documents"}
      />
    </div>
  );
};
