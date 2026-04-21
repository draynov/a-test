-- =========================================================
-- Section B - Stage 2
-- AttestationCard columns + relations
-- Safe for repeated execution
-- =========================================================

ALTER TABLE "AttestationCard"
  ADD COLUMN IF NOT EXISTS "cardType" "AttestationCardType" NOT NULL DEFAULT 'TEACHER',
  ADD COLUMN IF NOT EXISTS "sectionBTemplateId" TEXT,
  ADD COLUMN IF NOT EXISTS "sectionBStatus" "SectionBWorkflowStatus" NOT NULL DEFAULT 'DRAFT';

CREATE INDEX IF NOT EXISTS "AttestationCard_sectionBTemplateId_idx"
  ON "AttestationCard" ("sectionBTemplateId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'AttestationCard_sectionBTemplateId_fkey'
  ) THEN
    ALTER TABLE "AttestationCard"
      ADD CONSTRAINT "AttestationCard_sectionBTemplateId_fkey"
      FOREIGN KEY ("sectionBTemplateId")
      REFERENCES "SectionBTemplate"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
