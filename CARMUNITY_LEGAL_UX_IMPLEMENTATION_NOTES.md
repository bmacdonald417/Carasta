# Carmunity Legal UX — Implementation Notes

**Not legal advice.** Engineering and design use only. All published policies must be **reviewed and approved by qualified counsel** before being represented as final.

---

## 1. Objectives

- Capture **affirmative consent** at email/password sign-up for:
  - Terms of Service  
  - Privacy Policy  
  - Community Guidelines  
- Store **UTC timestamps** on `User` when each acknowledgment is recorded.
- Present **draft** legal and community pages with a visible **“pending legal review”** banner.

---

## 2. Sign-up UX

### 2.1 Required controls

- Three separate **checkboxes** (no single bundled “I agree to everything” without links).
- Each label links to the relevant page (`/terms`, `/privacy`, `/community-guidelines`) opening in a **new tab** (`target="_blank"`, `rel="noopener noreferrer"`).
- Submit disabled until all three are checked **or** server returns 400 with clear message (client + server validation).

### 2.2 Copy guidelines (drafting)

- Use “I have read and agree to the …” only if product intends strict interpretation; counsel may prefer “I agree to the …” with conspicuous links.
- Include a short line: “You must be at least [age] years old” **only after** counsel fixes age and jurisdiction.

### 2.3 Google OAuth gap

- OAuth users may not pass the same checkbox flow.
- **Follow-up (not blocking Phase 2 scaffolding)**: gate with a modal on first login, or require acceptance in **Settings → Legal** before certain actions.

---

## 3. API contract (`POST /api/auth/sign-up`)

### 3.1 Request body (email/password)

Existing fields plus booleans (all must be `true`):

- `acceptTerms: true`
- `acceptPrivacy: true`
- `acceptCommunityGuidelines: true`

### 3.2 Persistence

On successful user creation, set:

- `acceptedTermsAt = now()`
- `acceptedPrivacyAt = now()`
- `acceptedCommunityGuidelinesAt = now()`

If any boolean is false or missing, **reject** with 400.

---

## 4. Page structure

### 4.1 Terms (`/terms`)

Suggested H2 sections for counsel to fill:

1. Introduction & acceptance  
2. Eligibility & accounts  
3. Marketplace & auctions (if applicable)  
4. Carmunity feed & Discussions (UGC)  
5. Prohibited conduct  
6. Intellectual property  
7. Disclaimers & limitation of liability  
8. Dispute resolution & governing law  
9. Changes to terms  
10. Contact

### 4.2 Privacy (`/privacy`)

1. Who we are  
2. Data we collect  
3. How we use data  
4. Cookies & analytics  
5. Sharing & processors  
6. Retention  
7. Your rights (jurisdiction-specific placeholders)  
8. Children  
9. International transfers  
10. Contact & DSR channel  

### 4.3 Community Guidelines (`/community-guidelines`)

1. Be respectful  
2. Safety & lawful behavior  
3. No harassment, hate, or threats  
4. Authenticity & spam  
5. Marketplace integrity (if linked to auctions)  
6. Moderation & enforcement  
7. Appeals  
8. Contact

---

## 5. Visual treatment

- **Banner** at top of Terms, Privacy, and Community Guidelines:

  > **Draft — pending legal review.** This page is provided for development and transparency. It is not a final legal document.

- Use the same **design system** as the rest of Carmunity (`carasta-theme`, readable `max-w-3xl`, `text-muted-foreground` for meta).

---

## 6. Database & deploy

- After changing `schema.prisma`, run **`npx prisma db push`** (or your org’s migration workflow) against the target database.
- Never commit secrets; document env requirements in `.env.example` only.

---

## 7. Checklist before “final” launch

- [ ] Counsel-approved Terms, Privacy, and Community Guidelines  
- [ ] Remove or soften “draft” banners  
- [ ] Verify timestamps populate for email sign-ups  
- [ ] OAuth consent gap closed or documented in product terms  
- [ ] Data export/deletion process aligned with privacy promises  
