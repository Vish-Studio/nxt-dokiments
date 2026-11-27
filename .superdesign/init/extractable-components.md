# Extractable components
## Sidebar
- Source: `src/components/dashboard/sidebar/sidebar.tsx`
- Category: layout
- Description: Noir left navigation (logo, Dashboard, My Documents, My Templates, My Clients, Marketplace, account)
- Extractable props: activeItem (string, default "My Documents")
- Hardcoded: logo, nav labels, Phosphor icons
## PageBanner
- Source: `src/components/dashboard/page-banner/page-banner.tsx`
- Category: layout
- Description: Desktop page header band in the page tone with back link, title, refresh + bell
- Extractable props: title (string), tone (string, default "purple"), backLabel (string)
## MobilePageHeader
- Source: `src/components/dashboard/mobile-page-header/mobile-page-header.tsx`
- Category: layout
- Description: Sticky phone header with menu/back, title and actions
- Extractable props: title (string), backLabel (string)
## TemplateCard
- Source: `src/components/commons/template-card/template-card.tsx`
- Category: basic
- Description: Template thumbnail card, gallery variant with name and style caption
