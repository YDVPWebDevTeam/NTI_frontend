# NTI Frontend — Feature Status vs Technical Specification

Based on `NTI_technicka_specifikacia.docx`. Last verified: 2026-06-07.

> **Legend:**
> - `✅ DONE` — confirmed implemented in main branch
> - `🔄 IN PROGRESS` — open PR or issue is actively tracking this
> - `⏳ OPEN ISSUE` — GitHub issue created, not yet started
> - `❌ No BE` — no backend support; blocked until backend adds it
> - `⚠️ BE partial` — some backend exists but not complete; noted per item

---

## Tracking: Open PRs & Issues

> **Recently merged since last verification** (no longer open): PR#55 (Program A post-approval student
> project view, issue #38), PR#54 (public calls page, issue #43), PR#52 (mentor dashboard + Program B
> milestones, issue #39), PR#50/#49 (evaluator review workspace, issue #41), PR#47 (organization
> management — profile, documents, members, issue #19). Marketing pages (about, programs, partners,
> mentors, news) landed via the landing-page redesign and CMS-driven marketing work.

| # | Title | Covers |
|---|---|---|
| PR#57 (open) | feat(mentor): add Program A assigned project views | Mentor-side Program A list + detail + mentorship note creation — closes issue #40 (FE done; needs backend mentor-scoped endpoint + OpenAPI update) |
| Issue #40 (open, 🔄 PR#57) | Mentor Workspace: Program A Assigned Project Views | Mentor-side Program A project list + detail + note creation |
| Issue #44 (open) | Terms of Service, Privacy Policy | Static `/terms-of-service` and `/privacy-policy` pages |
| Issue #53 (open) | (Optional) Cloudflare Turnstile bot protection | Bot protection on public forms (login, register, contact, forgot-password) |
| Issue #56 (open) | Program A application detail cannot start section editing when backend returns no sections | Bug — empty-sections state blocks editing; also visible in admin moderation |

---

## What is blocked on backend work

These items **cannot be started** until the backend adds support:

- **In-app notifications** — no notifications API exists anywhere in the backend
- **Email template management** — no admin endpoint for viewing/editing transactional templates
- **Bulk / group messaging** — no endpoint for sending messages to a group of users
- **User notification preferences** — no preferences storage or endpoint
- **GDPR personal data export / deletion** — audit PDF export exists but no per-user data export or deletion endpoint
- **Scoring templates / configurable evaluation rubric** — evaluation criteria are hardcoded enums; no admin-configurable rubric endpoint
- **Program A student-facing milestone read** — only admin-scoped milestone endpoints exist; no student-scoped read endpoint
- **Empty application sections** (issue #56) — `GET /applications/{id}/sections` returns no sections for seeded applications, blocking section editing in both student detail and admin moderation

---

## 1. Public Web & CMS (spec §6.1, §9)

| Item | Status | Notes |
|---|---|---|
| Dedicated `/about` page | ✅ DONE | `(marketing)/about/page.tsx`, CMS-driven via `fetchAboutContent` |
| `/program-a` & `/program-b` landing | ✅ DONE | Single `(marketing)/programs/page.tsx` with `?program=a\|b` tabs; content currently hardcoded/localized (not CMS) |
| Dedicated `/partners` page | ✅ DONE | `(marketing)/partners/page.tsx`, CMS-driven via `fetchPartnersContent` |
| Dedicated `/mentors` page | ✅ DONE | `(marketing)/mentors/page.tsx`, CMS-driven via `fetchMentorsContent` |
| News / Articles section (`/news`) | ✅ DONE | `(marketing)/news/page.tsx` list + `[slug]` detail, CMS-driven, ISR 300s |
| Contact page (`/contact`) | ⚠️ Partial | No standalone route; contact form lives in `LandingFooter` reached via `#contact` anchor (`ROUTES.contact()`). No backend submission yet |
| Calls & deadlines page | ✅ DONE | Merged in PR#54 (issue #43); `(marketing)/calls/page.tsx` via `applicationsControllerListActivePublicCalls`, paginated (Program B only) |
| SEO metadata management | ⚠️ Partial | All marketing pages export `generateMetadata`; titles/descriptions partly from CMS, partly static. No CMS-managed SEO field model yet |
| `sitemap.xml` generation | [ ] Not started | No `src/app/sitemap.ts`; Next.js-native, no backend needed |

---

## 2. Auth Flows (spec §6.2)

| Item | Status | Notes |
|---|---|---|
| Forgot-password page | ✅ DONE | Merged in PR#36; `/forgot-password` |
| Email verification page | ✅ DONE | Merged in PR#36; `/verify-email?token=...` |
| Reset-password page | ✅ DONE | Merged in PR#36; URL token + manual fallback |
| Account security settings (password/email change) | ✅ DONE | Merged in PR#35; `/account` page with change-password and change-email flows |
| Terms of Service page (`/terms-of-service`) | ⏳ Issue #44 | Static page |
| Privacy Policy page (`/privacy-policy`) | ⏳ Issue #44 | Static page |
| Company partner registration flow | ✅ DONE | Company owner registration (`/register/company-owner`) covers this |
| Bot protection on public forms (Turnstile) | ⏳ Issue #53 | Optional enhancement; not started |

---

## 3. Review / Commission Workspace (spec §6.3, §7.4)

| Item | Status | Notes |
|---|---|---|
| Program A evaluation queue (reviewer-scoped) | ✅ DONE | Merged in PR#50 (issue #41); `/review/dashboard` queue with EVALUATING filter, call filter, sort, evaluated-by-me indicator |
| Evaluation scoring form (0–100 per criterion) | ✅ DONE | Merged in PR#50; `/review/applications/[id]` via `useApplicationsControllerCreateEvaluation` (upsert; existing evaluation editable) |
| Commission decision (recommendation submission) | ✅ DONE | Merged in PR#50; recommendation (APPROVE/NEEDS_INFO/REJECT) submitted with the evaluation. Lifecycle transitions remain admin-only by design |
| Needs-info request from reviewer | ✅ DONE | Merged in PR#36; admin moderation page |
| Scoring templates (admin-configurable rubric) | ❌ No BE | Criteria are hardcoded enums |
| Evaluation criteria config on Calls | ❌ No BE | No call-level rubric endpoint |

---

## 4. Mentor Workspace (spec §8.4)

| Item | Status | Notes |
|---|---|---|
| Mentor dashboard | ✅ DONE | Merged in PR#52 (issue #39); `mentor/dashboard/page.tsx` shows assigned Program B projects + next milestones via `useProgramBProjectsControllerListMy` |
| Program B milestone create/update UI (mentor) | ✅ DONE | Merged in PR#52; `mentor/program-b/projects/[id]/page.tsx` create/update via `useProgramBProjectsControllerCreateMilestone` / `UpdateMilestone` |
| Program A assigned project views (mentor) | 🔄 PR#57 | Not on main yet. PR#57 adds `mentor/program-a/projects` list + `[id]` detail; needs backend mentor-scoped Program A endpoint + OpenAPI update |
| Program A mentorship note creation (mentor) | 🔄 PR#57 | Wired in PR#57 via `useApplicationsControllerCreateMentorshipNote`; on main, hook is only used in admin moderation |
| Mentor assignment UI (admin) | ✅ DONE | Merged in PR#36; `admin/moderation/[applicationId]/page.tsx` |

---

## 5. Program A — Student-Facing Gaps (spec §7.3, §7.4)

| Item | Status | Notes |
|---|---|---|
| Admin lifecycle state transitions (approve, activate, pause, complete, archive) | ✅ DONE | Merged in PR#36; `admin/moderation/[applicationId]/page.tsx` |
| Student document management (attach docs to required slots) | ✅ DONE | `AttachDocumentSection` + `DocumentCompletenessSection` in `application-detail-sections.tsx` |
| Student needs-info reply & resubmit flow | ✅ DONE | `NeedsInfoThreadSection` with per-item reply and resubmit in `application-detail-page.tsx` |
| Submitted applications visible on student dashboard | ✅ DONE | Merged in PR#48 (issue #37); `MyApplicationsSection` in `student/dashboard/page.tsx` |
| Post-approval project view for students | ✅ DONE | Merged in PR#55 (issue #38); `features/student-workspace/routes/program-a-project-view.tsx` renders distinct view for ONBOARDING/ACTIVE_PROJECT/PAUSED/COMPLETED/ARCHIVED — status badge, mentor assignment, read-only mentorship notes, submitted-sections summary |
| Program A milestone tracking (student view) | ⚠️ BE partial | Post-approval view does **not** show milestones; admin milestone endpoints exist but no student-scoped read endpoint |

---

## 6. Program B — Remaining Gaps (spec §8.3, §8.4)

| Item | Status | Notes |
|---|---|---|
| Team application submission (student → backlog item) | ✅ DONE | Fully wired in `program-b-backlog-detail-page.tsx` with submit + withdraw |
| Product Owner assignment (company) | ✅ DONE | Assign-self and assign-member flows in `company/program-b/backlog/[id]/page.tsx` |
| Organization profile edit | ✅ DONE | Merged in PR#47 (issue #19); `organization-profile-section.tsx` via `useOrganizationControllerUpdateMyOrganization` (name, ICO, sector, description, website, logo) |
| Organization document upload/download | ✅ DONE | Merged in PR#47; `organization-documents-section.tsx` via `useOrganizationDocumentsController...Compat` hooks (presigned upload/download, visibility levels) |
| Organization member management | ⚠️ Partial | Merged in PR#47; list/remove/transfer-owner + invite (create/list/resend/revoke) and invite acceptance (`invite/page.tsx`). Per-member role-change UI not built (hook `useOrganizationControllerUpdateMemberRole` exists, unused) |
| Budget / student reward tracking | ✅ DONE | `useProgramBProjectsControllerUpdateReward` wired in admin + company project pages; read-only display on student project detail |

---

## 7. Notifications (spec §6.4)

| Item | Status | Notes |
|---|---|---|
| In-app notification center | ❌ No BE | No notifications API exists in backend |
| Admin email template management | ❌ No BE | No endpoint found |
| Bulk / group messaging | ❌ No BE | No endpoint found |
| User notification preferences | ❌ No BE | No endpoint found |

---

## 8. Admin Gaps (spec §6.5, §13)

| Item | Status | Notes |
|---|---|---|
| Active calls widget on admin overview | ✅ DONE | Merged in PR#46 (issue #42); active calls section in `admin/page.tsx` |
| Audit log viewer (paginated UI) | ⚠️ BE partial | Only PDF export exists (`useReportsControllerExportAuditPdf`); no paginated listing endpoint |
| GDPR tools (personal data export/deletion) | ❌ No BE | No per-user data export or deletion endpoint |

---

## 9. Student Team Workspace

| Item | Status | Notes |
|---|---|---|
| Team lock: buttons disabled when locked | ✅ DONE | `isLocked` derived from `team.lockedAt`; all mutating actions disabled in `team-workspace-sections.tsx` |
| Team lock: explanatory banner with context + application link | [ ] Not started | The disabled state exists but no banner explaining *why* it's locked or linking to the application |

---

## Summary Table

### Recently merged

| Issue / PR | Area |
|---|---|
| PR#55 (#38) | Program A: post-approval student project view (ONBOARDING/ACTIVE/PAUSED states) |
| PR#54 (#43) | Public: calls & deadlines page |
| PR#52 (#39) | Mentor workspace: dashboard + Program B milestone create/update |
| PR#50, PR#49 (#41) | Review workspace: evaluation queue, scoring form, recommendation submission |
| PR#47 (#19) | Organization management: profile edit, documents, members + invites |
| — | Marketing pages: about, programs, partners, mentors, news (landing redesign + CMS) |
| PR#48 (#37) | Student dashboard: submitted applications status + needs-info alert |
| PR#46 (#42) | Admin overview: active calls widget |
| PR#45 | Budget handling (Program A grants, Program B rewards) |
| PR#36 (#7) | Auth flows — forgot/reset password, verify email, admin Program A moderation page |
| PR#35 (#21) | Account security settings — password change, email change |

### In progress

| Issue / PR | Area | Note |
|---|---|---|
| Issue #40 / PR#57 | Mentor workspace: Program A assigned project views + mentorship note creation | FE done on branch; needs backend mentor-scoped Program A endpoint + OpenAPI update |

### Open issues — ready to implement

| Issue | Area | Priority |
|---|---|---|
| #44 | Terms of Service + Privacy Policy static pages | Low |
| #53 | (Optional) Turnstile bot protection on public forms | Low |
| #56 | Bug: section editing blocked when backend returns no sections | Medium |

### No issue yet — can be started (backend ready)

| Area | Priority | Note |
|---|---|---|
| Team lock explanatory banner | Low | Button-disabling already done; banner + application link missing |
| Standalone `/contact` page + form submission | Low | Footer `#contact` form exists; no dedicated page or backend submission |
| Sitemap (`sitemap.ts`) | Low | Next.js-native, no backend needed |
| CMS-managed SEO fields + CMS-driven `/programs` content | Low | Marketing pages live; SEO field model and programs CMS content still hardcoded |

### Blocked on backend

| Area | Priority | What's missing on backend |
|---|---|---|
| In-app notifications | Medium | No notifications API at all |
| Audit log viewer | Medium | Only PDF export exists; no paginated event listing endpoint |
| Program A student milestone view | Low | Only admin-scoped milestone endpoints exist |
| Empty application sections (issue #56) | Medium | `GET /applications/{id}/sections` returns nothing for seeded apps |
| GDPR personal data export / deletion | Low | No per-user data endpoints |
| Scoring templates / configurable rubric | Low | Criteria are hardcoded enums |
| Bulk / group messaging | Low | No endpoint |
