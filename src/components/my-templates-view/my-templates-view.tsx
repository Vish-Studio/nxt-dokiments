"use client";

import { TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { ButtonIcon } from "@/components/button-icon/button-icon";
import { TemplateThumbnail } from "@/components/template-thumbnail/template-thumbnail";
import { getTemplateById, tierLabels } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import { useSavedTemplates, useTemplatesStore } from "@/stores/templates-store";

export const MyTemplatesView = () => {
  const user = useAuthStore((state) => state.user);
  const saved = useSavedTemplates(user?.uid);
  const removeTemplate = useTemplatesStore((state) => state.removeTemplate);

  const handleRemove = (savedId: string) => {
    if (user) {
      removeTemplate(user.uid, savedId);
    }
  };

  if (saved.length === 0) {
    return (
      <div className="grid w-full place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
        <p className="font-title text-base font-bold text-nox-noir">No templates yet</p>
        <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
          Save templates from the marketplace and they will appear here, ready to use in your
          documents.
        </p>
        <Link
          className="btn btn-sm btn-primary mt-5 font-title font-semibold tracking-normal"
          href="/marketplace"
        >
          Browse marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-steel-mist pb-4">
        <div>
          <h3 className="font-title text-lg font-bold text-bloodwood-deep">My Templates</h3>
          <p className="mt-1 text-sm leading-6 text-nox-noir/60">
            Templates saved to your account. Create documents from them on the Documents page.
          </p>
        </div>
        <Link
          className="btn btn-sm btn-primary font-title font-semibold tracking-normal"
          href="/documents"
        >
          New document
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {saved.map((item) => {
          const template = getTemplateById(item.templateId);

          if (!template) {
            return null;
          }

          return (
            <article
              className="flex flex-col rounded-box border border-steel-mist bg-base-100 p-4"
              key={item.savedId}
            >
              <TemplateThumbnail template={template} />

              <div className="mt-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate font-title text-base font-bold text-nox-noir">
                    {template.name}
                  </h4>
                  <p className="text-xs text-nox-noir/55">
                    {template.style.name} · {tierLabels[template.tier]}
                  </p>
                </div>
                <ButtonIcon
                  aria-label={`Remove ${template.name} template`}
                  icon={<TrashIcon aria-hidden size={16} weight="bold" />}
                  onClick={() => handleRemove(item.savedId)}
                  shape="square"
                  size="sm"
                  variant="outline"
                />
              </div>

              <Link
                className="btn btn-sm btn-primary mt-4 font-title font-semibold tracking-normal"
                href="/documents"
              >
                Use in document
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};
