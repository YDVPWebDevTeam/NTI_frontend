# NTI Frontend — Feature Status vs Technical Specification

Based on `NTI_technicka_specifikacia.docx`. Last verified: 2026-06-06.

> **Legend:**
> - `✅ DONE` — confirmed implemented in main branch
> - `🔄 IN PROGRESS` — open PR or issue is actively tracking this
> - `⏳ OPEN ISSUE` — GitHub issue created, not yet started
> - `❌ No BE` — no backend support; blocked until backend adds it
> - `⚠️ BE partial` — some backend exists but not complete; noted per item

---

## Tracking: Open PRs & Issues

> **Recently merged** (no longer open): PR#36 (auth flow, issue #7), PR#35 (account settings, issue #21),
> PR#46 (active calls widget, issue #42), PR#48 (student submitted apps, issue #37), PR#45 (budget handling).

| # | Title | Covers |
|---|---|---|
| PR#47 (open) | feat(organization): organization profile | Company org profile edit — part of issue #19 |
| Issue #19 (open) | Finish Organization Management API Integration | Company org profile edit, document upload/download, member management |
| Issue #38 (open) | Program A: Post-Approval Project View for Students | Student view of ONBOARDING / ACTIVE / PAUSED project states |
| Issue #39 (open) | Mentor Workspace: Dashboard & Program B Milestone Management | Mentor dashboard + milestone create/update UI |
| Issue #40 (open) | Mentor Workspace: Program A Assigned Project Views | Mentor-side Program A project list + detail + note creation |
| Issue #41 (🔄 on `feature/evaluator-review-workspace`) | Review Workspace: Program A Evaluation Queue & Scoring | Evaluator queue, scoring form, recommendation submission — implemented (FE + BE), pending PR/merge |
| Issue #43 (open) | Public: Calls & Deadlines Page | Public `/calls` listing page with deadlines and CTAs |
| Issue #44 (open) | Terms of Service, Privacy Policy | Static `/terms-of-service` and `/privacy-policy` pages |

---

## What is blocked on backend work

These items **cannot be started** until the backend adds support:

- **In-app notifications** — no notifications API exists anywhere in the backend
- **Email template management** — no admin endpoint for viewing/editing transactional templates
- **Bulk / group messaging** — no endpoint for sending messages to a group of users
- **User notification preferences** — no preferences storage or endpoint
- ~~**Budget tracking** (Program A grants, Program B rewards)~~ — **DONE** (backend unblocked)
- **GDPR personal data export / deletion** — audit PDF export exists but no per-user data export or deletion endpoint
- **Scoring templates / configurable evaluation rubric** — evaluation criteria are hardcoded enums; no admin-configurable rubric endpoint
- **Program A student-facing milestone read** — only admin-scoped milestone endpoints exist; no student-scoped read endpoint

---

## 1. Public Web & CMS (spec §6.1, §9)

| Item | Status | Notes |
|---|---|---|
| Dedicated `/about` page | [ ] Not started | Static / CMS content only |
| Dedicated `/program-a` landing page | [ ] Not started | CMS project scope |
| Dedicated `/program-b` landing page | [ ] Not started | CMS project scope |
| Dedicated `/partners` and `/mentors` pages | [ ] Not started | CMS project scope |
| News / Articles section (`/news`) | [ ] Not started | CMS project scope |
| Contact page (`/contact`) | [ ] Not started | Static form, no backend needed |
| Calls & deadlines page | ⏳ Issue #43 | `useApplicationsControllerListActivePublicCalls` ready |
| SEO metadata management in CMS | [ ] Not started | CMS project scope |
| `sitemap.xml` generation | [ ] Not started | Next.js-native, no backend needed |

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
| Company partner registration flow | ✅ DONE | Company owner registration (`/register/company-owner`) covers this. The empty `src/app/(auth)/register/company-partner/` directory is dead code and can be deleted. |

---

## 3. Review / Commission Workspace (spec §6.3, §7.4)

| Item | Status | Notes |
|---|---|---|
| Program A evaluation queue (reviewer-scoped) | 🔄 IN PROGRESS | Branch `feature/evaluator-review-workspace`: `/review/dashboard` queue (EVALUATING filter, call filter, sort, evaluated-by-me badge). Backend guard relaxed — EVALUATOR can now read application detail + sections; list endpoint already allowed reviewers |
| Evaluation scoring form (0–100 per criterion) | 🔄 IN PROGRESS | Branch `feature/evaluator-review-workspace`: `/review/applications/[id]` scoring form via `useApplicationsControllerCreateEvaluation`; existing evaluation editable (backend create is now an upsert) |
| Commission decision (recommendation submission) | 🔄 IN PROGRESS | Branch `feature/evaluator-review-workspace`: recommendation (APPROVE/NEEDS_INFO/REJECT) submitted as part of the evaluation. Lifecycle transitions remain admin-only by design |
| Needs-info request from reviewer | ✅ DONE | Merged in PR#36; admin moderation page |
| Scoring templates (admin-configurable rubric) | ❌ No BE | Criteria are hardcoded enums |
| Evaluation criteria config on Calls | ❌ No BE | No call-level rubric endpoint |

---

## 4. Mentor Workspace (spec §8.4)

| Item | Status | Notes |
|---|---|---|
| Mentor dashboard | ⏳ Issue #39 | Currently a `WorkspacePlaceholderPage` |
| Program B milestone create/update UI (mentor) | ⏳ Issue #39 | Hooks generated; read-only view exists but no write form |
| Program A assigned project views (mentor) | ⏳ Issue #40 | ⚠️ No mentor-scoped Program A list endpoint; may need minor backend addition |
| Program A mentorship note creation (mentor) | ⏳ Issue #40 | `useApplicationsControllerCreateMentorshipNote` ready |
| Mentor assignment UI (admin) | ✅ DONE | Merged in PR#36; `admin/moderation/[applicationId]/page.tsx` |

---

## 5. Program A — Student-Facing Gaps (spec §7.3, §7.4)

| Item | Status | Notes |
|---|---|---|
| Admin lifecycle state transitions (approve, activate, pause, complete, archive) | ✅ DONE | Merged in PR#36; `admin/moderation/[applicationId]/page.tsx` |
| Student document management (attach docs to required slots) | ✅ DONE | `AttachDocumentSection` + `DocumentCompletenessSection` in `application-detail-sections.tsx` |
| Student needs-info reply & resubmit flow | ✅ DONE | `NeedsInfoThreadSection` with per-item reply and resubmit in `application-detail-page.tsx` |
| Submitted applications visible on student dashboard | ✅ DONE | Merged in PR#48 (issue #37); `MyApplicationsSection` in `student/dashboard/page.tsx` shows submitted apps + NEEDS_INFO banner |
| Post-approval project view for students | ⏳ Issue #38 | No ONBOARDING/ACTIVE/PAUSED view; same draft form shown regardless of status |
| Program A milestone tracking (student view) | ⚠️ BE partial | Admin milestone endpoints exist; no student-scoped read endpoint yet |
| Budget tracking for grants | ✅ DONE | `useAdminApplicationsControllerUpdateGrantBudget` wired in `admin/moderation/[applicationId]/page.tsx`; grant budget shown in info rows and editable in sidebar when status ∈ {APPROVED, ONBOARDING, ACTIVE_PROJECT, PAUSED} |

---

## 6. Program B — Remaining Gaps (spec §8.3, §8.4)

| Item | Status | Notes |
|---|---|---|
| Team application submission (student → backlog item) | ✅ DONE | Fully wired in `program-b-backlog-detail-page.tsx` with submit + withdraw |
| Product Owner assignment (company) | ✅ DONE | Assign-self and assign-member flows in `company/program-b/backlog/[id]/page.tsx` |
| Organization profile edit, documents, member management | 🔄 Issue #19 | PR#47 open (org profile edit); documents + member management still pending |
| Budget / student reward tracking | ✅ DONE | `useProgramBProjectsControllerUpdateReward` wired in `admin/program-b/projects/[id]/page.tsx` (admin edit) and `company/program-b/projects/[id]/page.tsx` (company edit in Overview tab); read-only display added to student project detail page |

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
| PR#36 (#7) | Auth flows — forgot/reset password, verify email, admin Program A moderation page |
| PR#35 (#21) | Account security settings — password change, email change |
| PR#46 (#42) | Admin overview: active calls widget |
| PR#48 (#37) | Student dashboard: submitted applications status + needs-info alert |
| PR#45 | Budget handling (Program A grants, Program B rewards) |

### In progress

| Issue / PR | Area | Note |
|---|---|---|
| Issue #19 / PR#47 | Organization management — profile edit, documents, member management | PR#47 open for profile edit; documents + members pending |
| Issue #41 | Review workspace: evaluation queue & scoring | Implemented on branch `feature/evaluator-review-workspace` (FE + BE); pending PR/merge |

### Open issues — ready to implement

| Issue | Area | Priority |
|---|---|---|
| #38 | Program A: post-approval project view for students | High |
| #39 | Mentor workspace: dashboard + Program B milestone management | Medium |
| #40 | Mentor workspace: Program A assigned project views | Medium |
| #43 | Public: calls & deadlines page | Medium |
| #44 | Terms of Service + Privacy Policy static pages | Low |

### No issue yet — can be started (backend ready)

| Area | Priority | Note |
|---|---|---|
| Team lock explanatory banner | Low | Button-disabling already done; banner + application link missing |
| Dedicated public pages (About, Program A/B, Contact, News) | Medium | CMS project scope |
| Sitemap + SEO CMS fields | Low | CMS project scope |

### Blocked on backend

| Area | Priority | What's missing on backend |
|---|---|---|
| In-app notifications | Medium | No notifications API at all |
| Audit log viewer | Medium | Only PDF export exists; no paginated event listing endpoint |
| Program A student milestone view | Low | Only admin-scoped milestone endpoints exist |
| ~~Budget tracking (grants + rewards)~~ | ~~Low~~ | ~~No budget entity or endpoints~~ — **DONE** |
| GDPR personal data export / deletion | Low | No per-user data endpoints |
| Scoring templates / configurable rubric | Low | Criteria are hardcoded enums |
| Bulk / group messaging | Low | No endpoint |
