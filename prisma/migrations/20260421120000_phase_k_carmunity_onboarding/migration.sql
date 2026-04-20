-- Phase K: Carmunity onboarding + interest prefs (additive)
ALTER TABLE "User" ADD COLUMN "carmunityOnboardingCompletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "carmunityInterestPrefs" JSONB;

-- Existing accounts: do not force the first-run panel on everyone at deploy.
UPDATE "User" SET "carmunityOnboardingCompletedAt" = NOW() WHERE "carmunityOnboardingCompletedAt" IS NULL;
