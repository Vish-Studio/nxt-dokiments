"use client";

import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CreditCardIcon,
  FileTextIcon,
  LayoutIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";

import { TemplateThumbnail } from "@/components/template-thumbnail/template-thumbnail";
import { getTemplateById } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import { useUserDocuments } from "@/stores/documents-store";
import { useTemplateLibrary } from "@/stores/templates-store";
import type { UserRole } from "@/types/auth";

const roleLabels: Record<UserRole, string> = {
  free: "Free",
  gold: "Gold",
  silver: "Silver",
  special: "Special",
  superadmin: "Super admin",
};

type StatCard = {
  href: string;
  icon: Icon;
  label: string;
  value: string;
};

export const DashboardView = () => {
  const user = useAuthStore((state) => state.user);
  const { limit, saved } = useTemplateLibrary();
  const documents = useUserDocuments(user?.uid);

  const isFree = !user || user.role === "free";
  const firstName = (user?.displayName ?? "there").split(" ")[0];

  const stats: StatCard[] = [
    {
      href: "/my-templates",
      icon: LayoutIcon,
      label: "Saved templates",
      value: isFree ? `${saved.length} / ${limit}` : `${saved.length}`,
    },
    {
      href: "/documents",
      icon: FileTextIcon,
      label: "Documents",
      value: `${documents.length}`,
    },
    {
      href: "/subscription",
      icon: CreditCardIcon,
      label: "Current plan",
      value: user ? roleLabels[user.role] : "Free",
    },
  ];

  const recentDocuments = [...documents].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
  const recentTemplates = saved.slice(-4).reverse();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-title text-2xl font-medium text-nox-noir sm:text-3xl">
          <span>
            Welcome back,
          <span className="font-bold">{firstName}</span>
          </span>
        </h1>
        <p className="mt-1 text-sm text-nox-noir/60">Here&apos;s a quick look at your workspace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const StatIcon = stat.icon;

          return (
            <Link
              className="rounded-box border border-steel-mist bg-base-100 p-5 transition-colors hover:bg-base-200"
              href={stat.href}
              key={stat.label}
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-base-200 text-bloodwood-deep">
                  <StatIcon aria-hidden size={20} weight="bold" />
                </span>
                <ArrowUpRightIcon aria-hidden className="text-nox-noir/30" size={18} weight="bold" />
              </div>
              <p className="mt-5 font-title text-2xl font-bold text-nox-noir">{stat.value}</p>
              <p className="text-sm text-nox-noir/60">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          className="flex items-center justify-between gap-4 rounded-box bg-bloodwood-deep p-6 text-white transition hover:brightness-110"
          href="/marketplace"
        >
          <div>
            <h3 className="font-title text-lg font-bold">Browse the marketplace</h3>
            <p className="mt-1 text-sm text-white/65">
              Find a template and save it to your account.
            </p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-golden-harvest text-bloodwood-deep">
            <ArrowRightIcon aria-hidden size={20} weight="bold" />
          </span>
        </Link>

        <Link
          className="flex items-center justify-between gap-4 rounded-box border border-steel-mist bg-base-100 p-6 transition-colors hover:bg-base-200"
          href="/documents"
        >
          <div>
            <h3 className="font-title text-lg font-bold text-nox-noir">Create a document</h3>
            <p className="mt-1 text-sm text-nox-noir/60">Start from a template you&apos;ve saved.</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-base-200 text-bloodwood-deep">
            <PlusIcon aria-hidden size={20} weight="bold" />
          </span>
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-title text-base font-bold text-nox-noir">Recent documents</h3>
          {documents.length > 0 ? (
            <Link
              className="font-title text-sm font-semibold text-bloodwood-deep hover:underline"
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
              className="font-title text-sm font-semibold text-bloodwood-deep hover:underline"
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
                <Link
                  className="flex flex-col rounded-box border border-steel-mist bg-base-100 p-3 transition-colors hover:bg-base-200"
                  href="/my-templates"
                  key={item.savedId}
                >
                  <TemplateThumbnail template={template} />
                  <div className="mt-3 min-w-0">
                    <h4 className="truncate font-title text-sm font-bold text-nox-noir">
                      {template.name}
                    </h4>
                    <p className="truncate text-xs text-nox-noir/55">{template.style.name} style</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
