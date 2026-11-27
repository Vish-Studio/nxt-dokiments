# Routes (Next App Router, src/app)
- `/cookies` → `src/app/cookies/page.tsx`
- `/dashboard` → `src/app/dashboard/page.tsx`
- `/forgot-password` → `src/app/forgot-password/page.tsx`
- `/invoice-maker-mauritius` → `src/app/invoice-maker-mauritius/page.tsx`
- `/marketplace` → `src/app/marketplace/page.tsx`
- `/my-clients` → `src/app/my-clients/page.tsx`
- `/my-documents/companies/[key]` → `src/app/my-documents/companies/[key]/page.tsx`
- `/my-documents` → `src/app/my-documents/page.tsx`
- `/my-documents/shared/[id]` → `src/app/my-documents/shared/[id]/page.tsx`
- `/my-templates` → `src/app/my-templates/page.tsx`
- `/offline` → `src/app/offline/page.tsx`
- `/` → `src/app/page.tsx`
- `/privacy` → `src/app/privacy/page.tsx`
- `/settings` → `src/app/settings/page.tsx`
- `/shared/[token]` → `src/app/shared/[token]/page.tsx`
- `/sign-in` → `src/app/sign-in/page.tsx`
- `/sign-up` → `src/app/sign-up/page.tsx`
- `/subscription` → `src/app/subscription/page.tsx`
- `/terms` → `src/app/terms/page.tsx`

Dashboard pages use AppShell. /my-documents renders DocumentsView which switches mode list | picker ('Choose a template') | editor in place (no route change).
