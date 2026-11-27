# Pages
## /my-documents (My Documents + Choose a template picker)
Entry: src/app/my-documents/page.tsx
- src/components/dashboard/app-shell/app-shell.tsx (sidebar, page-banner, mobile-page-header)
- src/components/dashboard/documents-view/documents-view.tsx (picker branch lines 1171-1227; list branch 1229+)
  - src/components/commons/template-card/template-card.tsx → src/components/commons/template-thumbnail/template-thumbnail.tsx
  - src/components/commons/template-card-skeleton, src/components/commons/loading-status, src/components/commons/template-preview-dialog, src/components/commons/tab-menu, src/components/commons/collection-toolbar, src/components/commons/empty-state, src/components/commons/floating-action-button
## /my-templates
Entry: src/app/my-templates/page.tsx
- src/components/dashboard/my-templates-view/my-templates-view.tsx (grouped gallery with toolbar)
  - src/components/commons/template-card, src/components/commons/collection-toolbar
## /marketplace
- src/components/dashboard/marketplace-browser/marketplace-browser.tsx, src/components/dashboard/marketplace-category-nav
