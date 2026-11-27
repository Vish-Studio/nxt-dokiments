# Dashboard UX flow

The UX contract for every signed-in page. UX decisions come first; the UI in
`src/components/dashboard/` follows from them, and the `dokiments-ui` skill holds
the pixel-level rules. If a page and this document disagree, fix the page.

## 1. Who it is for and what they are trying to do

Freelancers and owners of small businesses who send a handful of business
documents a week (quotations, invoices, contracts, NDAs) to a small set of
clients, and who are not designers or lawyers.

| Job to be done | The question in their head | Where it is answered |
| --- | --- | --- |
| Get a first document out | "Where do I start?" | Marketplace, then My Templates |
| Do the next document for the same client | "I did this last month" | My Documents (Companies), Dashboard |
| Get it signed | "Did they see it? Did they sign?" | My Documents (status), Shared with me |
| Keep client details in one place | "Don't make me retype this" | My Clients (prefills documents) |
| Stay on the right plan | "What am I allowed to do?" | Subscription, Settings |

## 2. Core journeys

Each step is one tap or click from the previous one. A journey that needs more
than five steps is a design bug.

**A. First document.** Dashboard "Explore templates" → Marketplace (browse by
category, preview) → Save template → My Templates → "Use document" → editor
(client prefilled if chosen; a dark bar at the bottom centre keeps Preview on
phones, Download PDF, Share and Save in reach; Delete stays in the row menu) → Save → the saved dialog offers Share (main)
and Download PDF, plus Back to documents (closing it keeps editing).

**B. Repeat client.** Dashboard "Continue work", or My Documents → Companies →
company → "New document for {company}" → template picker (a "For: {company}"
chip) → editor with the client prefilled.

**A2. New document from My Documents.** "New document" (yellow toolbar button,
"+" on phones) → template picker → editor. Desktop: pick a row, check the live
preview, "Use this template" (or Enter). Phones: the list only; one tap opens the
editor. Back (top bar, browser or phone gesture) returns to the list. See
`docs/choose-template-redesign.md`.

**C. Send for signature.** My Documents → row ⋮ → Share → recipients → Send. The
row's status pill then reads "Awaiting signature", then "Signed". Shared copy via
"View shared copy".

**D. Add a client.** My Clients → Add client (side panel) → the client is offered
when preparing a document.

**D2. Add a client while writing a document.** Editor → Client details → "New
client" → type their details → Next → "Save this client?" → Save client (added
to My Clients, toast) or Not now. Either way the document keeps the details and
Items opens. Picking "Saved client" instead fills the fields from My Clients.

**E. Sign something sent to me.** Notification bell, or My Documents → Shared with
me → open → sign.

## 3. Information architecture

The sidebar follows the order of the journey, not the alphabet:

1. **Dashboard**: overview and the way back to work in progress.
2. **My Documents**: the work (Companies · My documents · Shared with me · CVs).
3. **My Templates**: the library of saved templates.
4. **My Clients**: the people documents are for.
5. **Marketplace**: discovery, feeding My Templates.
6. **Subscription**, then Getting started, Send feedback, Settings.

Every list page answers three questions in the same order: *what is this*
(top-bar title), *how do I find something* (search, filters, sort), *what can I
do* (one primary action, row actions).

## 4. Page anatomy (the contract)

Every collection page (My Documents, My Templates, My Clients, Marketplace) is the
same stack. Pages that are not collections (Dashboard, Subscription, Settings)
keep their own content but obey sections 5 to 7.

```
Top bar        Page title (+ back arrow on sub-pages) · desktop search · refresh / bell / profile
[Tabs]         Only when the page has mutually exclusive views (My Documents)
Toolbar        Filter chips · Sort · plain-English count · ONE primary action (right)
Content        Rows (documents), cards (clients), template grid (templates)
State          Loading skeleton → Empty → Error, always in the content area
```

### Toolbar

- **Chips, not menus.** Filters are stackable chips that always show their value
  ("Type Any ▾"); active ones go dark. Never a hidden "Filter" menu on desktop.
- **Phones: one fixed row** of search, filter icon, sort icon. The filter icon
  opens a sheet with every filter and "Clear filters" before "Done". The row
  never changes height between tabs; a tab it does not apply to disables it.
- **Count** in plain English with correct plurals ("3 clients"). It is hidden on
  phones (screen-reader only).
- **One primary action** per page, yellow, at the right of the toolbar on desktop
  and a floating "+" on phones: New document · Add client · Browse marketplace
  (on My Templates). Marketplace has none: its primary action is on each card.
- **Reset** appears only when search or a filter is set, and never resets the sort.

### Rows and cards

- Clicking the row or card opens it (preview, panel, company page).
- Row actions live in a **vertical ⋮** menu, never horizontal dots: a popover on
  desktop, a bottom sheet on phones, titled with the item's icon and name.
- At most one visible shortcut next to the ⋮ (Download PDF on documents).
- **Destructive actions** are last, red, after a divider, and always confirm
  ("Delete client?") with what is lost and whether it can be undone.

### States

| State | Pattern | Rules |
| --- | --- | --- |
| Loading | Skeleton shaped like the content, plus a `status` message | No spinner-only screens |
| First-time empty | `EmptyState` with icon, title, one sentence, and **the action that fixes it** | "No clients yet" offers "Add client" |
| Filtered empty | `EmptyState` titled "No … match", with "Clear filters" | Never the first-time copy |
| Error | `EmptyState` `tone="error"`: what failed, that data is safe, **Try again** | Never shown as empty: it would say the user's data is gone |
| Not applicable | Toolbar controls disabled, not removed | Prevents layout shift |

## 5. Navigation and feedback

- Sub-pages (company page, shared document, template picker, editor) show a back
  arrow in the top bar; there is no "Back to …" button inside content. In-place
  sub-pages push a history entry, so the browser and phone back return to the list.
- Side panels hold create/edit (clients, documents); dialogs only for decisions.
- Success is a toast; failure is inline where it happened, with a way to retry.

## 6. Phones

Phones are first-class, not a squeezed desktop.

- Tabs: inactive tabs are icon-only, the active one shows its label (`fitOnPhones`).
- The primary action is the floating "+", hidden while a panel is open.
- Nothing scrolls sideways except a deliberate carousel. Tab and chip rows that
  would overflow collapse (tabs to icons, chips to the filter sheet).
- Touch targets are at least 40px; sheet items are 44px.

## 7. Content rules

- Plain words over jargon: "Not shared", not "unsent"; "Awaiting signature".
- Dates are dd/mm/yy in lists; amounts keep the user's currency text.
- Every empty and error state says what happened and what to do next.

## 8. Audit: where the pages drifted, and the decision

| # | Finding | Decision | Status |
| --- | --- | --- | --- |
| 1 | My Documents uses filter chips; Clients, Templates and Marketplace use a hidden "Filter" menu | All collection pages use chips (section 4) | Done |
| 2 | Only My Documents shows a count | Every collection page shows its count | Done |
| 3 | Four hand-built empty states (templates, clients, client error, marketplace) with different icons, heights and no action | One `EmptyState` with an optional action and an error tone | Done |
| 4 | Client cards use horizontal dots; documents use vertical ⋮ | Vertical ⋮ everywhere, with an icon in the sheet title | Done |
| 5 | My Templates has no primary action when it has templates | "Browse marketplace" is the page's primary action | Done |
| 6 | Client error state looks like an empty state | Error tone with "Try again" | Done |
| 7 | Settings tabs overflow on phones ("Promo" is cut off) | Same `fitOnPhones` tabs as My Documents | Done |
| 8 | "No matching templates" has no way to recover | "Clear filters" action | Done |

Also fixed in the same pass: the document lists (My documents, CVs) now show a
filtered-empty state ("No documents match", "No CVs yet") instead of a bare table
header, and "No documents match" on Companies offers "Clear filters".

## 9. Not in this pass

Dashboard layout, Subscription plan cards and the editor keep their current
design; they already follow sections 5 to 7. Revisit if usage data says otherwise.

Known follow-ups (not blocking): the phone top bar truncates long titles such as
"My Templates" next to the three header icons; the My Templates first-time empty
state shows no toolbar because there is nothing to filter, which is intended.
