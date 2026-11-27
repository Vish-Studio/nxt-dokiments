# Dokiments design system

## Product
Dokiments is a business-document workspace (Mauritius SMEs/freelancers): save templates from a marketplace, create documents (invoices, quotations, contracts, NDAs, proposals, CVs) prefilled from a client book, export PDF, share with e-sign. PWA, used heavily on phones.

Key journey here: My Documents → "New document" → Choose a template (from the user's saved templates) → editor.

## Visual language
- Flat / neo-brutalist-lite, Bento grids, calm and clean. No gradients, no glassmorphism, depth 0, only one soft shadow (0 16px 40px rgb(20 20 20/.08)) for document thumbnails.
- App chrome is nox-noir #141414: noir left sidebar; content sits in a white panel with large rounded corners (2rem) inset 16px from chrome on desktop.
- Each page has a solid tone banner at the top of the panel. My Documents = play-purple #c9b6f4. Others: templates pink #f7cad8, clients blue #93cdf6, marketplace teal #6ccaba, settings golden.
- Accent / active / primary CTA highlight: golden-harvest #ffd066 with nox-noir text. Primary buttons: nox-noir bg with white text. Outline buttons: 1px steel-mist border.
- Borders: 1px steel-mist #cfcfcf. Surfaces: white #fff and base-200 #f6f6f6.
- Muted text: nox-noir at 60% opacity.

## Type
- Urbanist for everything (titles bold/semibold, body regular). Title sizes: page 28-32px bold, section 18px bold, card title 14px semibold, caption 12px muted.

## Shape & spacing
- Radius: inputs/buttons 0.5rem, cards/boxes 1rem, segmented tabs 0.625rem, shell panel 2rem.
- Spacing on a 4px grid; page gutters 16px phone, 24-32px desktop; card gaps 16px.
- Buttons sm height 32px; phone touch targets ≥ 44px.

## Components in use
- TabMenu: segmented tab bar with Phosphor icon + label, active tab noir bg/white text.
- CollectionToolbar: search input (left), filter chips ("Type Any", "Style Any"), sort chip ("Recently added"), count text, end action button.
- TemplateCard (gallery): A4 document thumbnail on white with soft shadow, name centered below (14px semibold), style caption (12px muted).
- EmptyState: dashed steel-mist box, Phosphor icon, bold title, muted description, small CTA.
- FloatingActionButton on phones: noir round button bottom-right.
- Icons: Phosphor (regular weight; bold for emphasis), 16-20px.

## Phone
- Sticky mobile page header in the page tone with back arrow + title; sidebar becomes a drawer. Toolbars collapse into the header. Content single column, 16px gutters.
