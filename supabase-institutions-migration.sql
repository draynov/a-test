-- =========================================================
-- Institutions migration (manual, idempotent)
-- Run in Supabase SQL Editor
-- =========================================================

-- 1) Create Institution table
CREATE TABLE IF NOT EXISTS "Institution" (
  "id" TEXT NOT NULL,
  "neispuoCode" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "municipality" VARCHAR(100) NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- 2) Constraints / indexes for Institution
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Institution_neispuoCode_key'
  ) THEN
    ALTER TABLE "Institution"
      ADD CONSTRAINT "Institution_neispuoCode_key" UNIQUE ("neispuoCode");
  END IF;
END $$;

-- 5) RUO offices and representatives registry (separate from Staff and User login accounts)
CREATE TABLE IF NOT EXISTS "RuoOffice" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "region" VARCHAR(120) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RuoOffice_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RuoOffice_name_key'
  ) THEN
    ALTER TABLE "RuoOffice"
      ADD CONSTRAINT "RuoOffice_name_key"
      UNIQUE ("name");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RuoOffice_region_key'
  ) THEN
    ALTER TABLE "RuoOffice"
      ADD CONSTRAINT "RuoOffice_region_key"
      UNIQUE ("region");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "RuoRepresentative" (
  "id" TEXT NOT NULL,
  "firstName" VARCHAR(80) NOT NULL,
  "middleName" VARCHAR(80),
  "lastName" VARCHAR(80) NOT NULL,
  "ruoOfficeId" TEXT NOT NULL,
  "userId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RuoRepresentative_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RuoRepresentative_ruoOfficeId_idx"
  ON "RuoRepresentative"("ruoOfficeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RuoRepresentative_userId_key'
  ) THEN
    ALTER TABLE "RuoRepresentative"
      ADD CONSTRAINT "RuoRepresentative_userId_key"
      UNIQUE ("userId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RuoRepresentative_ruoOfficeId_fkey'
  ) THEN
    ALTER TABLE "RuoRepresentative"
      ADD CONSTRAINT "RuoRepresentative_ruoOfficeId_fkey"
      FOREIGN KEY ("ruoOfficeId") REFERENCES "RuoOffice"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RuoRepresentative_userId_fkey'
  ) THEN
    ALTER TABLE "RuoRepresentative"
      ADD CONSTRAINT "RuoRepresentative_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Institution_createdBy_idx"
  ON "Institution"("createdBy");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Institution_createdBy_fkey'
  ) THEN
    ALTER TABLE "Institution"
      ADD CONSTRAINT "Institution_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "User"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

-- 3) Link SectionBTemplate -> Institution
ALTER TABLE "SectionBTemplate"
  ADD COLUMN IF NOT EXISTS "institutionId" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "SectionBTemplate"
    WHERE "institutionId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot make SectionBTemplate.institutionId NOT NULL because existing rows have NULL institutionId.';
  END IF;
END $$;

ALTER TABLE "SectionBTemplate"
  ALTER COLUMN "institutionId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "SectionBTemplate_institutionId_idx"
  ON "SectionBTemplate"("institutionId");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SectionBTemplate_name_cardType_key'
  ) THEN
    ALTER TABLE "SectionBTemplate"
      DROP CONSTRAINT "SectionBTemplate_name_cardType_key";
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SectionBTemplate_institutionId_name_cardType_key'
  ) THEN
    ALTER TABLE "SectionBTemplate"
      ADD CONSTRAINT "SectionBTemplate_institutionId_name_cardType_key"
      UNIQUE ("institutionId", "name", "cardType");
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SectionBTemplate_institutionId_fkey'
  ) THEN
    ALTER TABLE "SectionBTemplate"
      DROP CONSTRAINT "SectionBTemplate_institutionId_fkey";
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SectionBTemplate_institutionId_fkey'
  ) THEN
    ALTER TABLE "SectionBTemplate"
      ADD CONSTRAINT "SectionBTemplate_institutionId_fkey"
      FOREIGN KEY ("institutionId") REFERENCES "Institution"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;

-- 4) Staff registry (separate from User login accounts)
DO $$
BEGIN
  CREATE TYPE "StaffIdentifierType" AS ENUM ('EGN', 'LNCH', 'SERVICE_ID');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "StaffInstitutionRole" AS ENUM ('INSTITUTION_ADMIN', 'STAFF_MEMBER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Staff" (
  "id" TEXT NOT NULL,
  "firstName" VARCHAR(80) NOT NULL,
  "middleName" VARCHAR(80),
  "lastName" VARCHAR(80) NOT NULL,
  "identifierType" "StaffIdentifierType" NOT NULL,
  "identifierValue" VARCHAR(30) NOT NULL,
  "institutionId" TEXT NOT NULL,
  "institutionRole" "StaffInstitutionRole" NOT NULL DEFAULT 'STAFF_MEMBER',
  "userId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Staff_identifierType_identifierValue_key'
  ) THEN
    ALTER TABLE "Staff"
      ADD CONSTRAINT "Staff_identifierType_identifierValue_key"
      UNIQUE ("identifierType", "identifierValue");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Staff_userId_key'
  ) THEN
    ALTER TABLE "Staff"
      ADD CONSTRAINT "Staff_userId_key"
      UNIQUE ("userId");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Staff_institutionId_idx"
  ON "Staff"("institutionId");

CREATE INDEX IF NOT EXISTS "Staff_institutionRole_idx"
  ON "Staff"("institutionRole");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Staff_institutionId_fkey'
  ) THEN
    ALTER TABLE "Staff"
      ADD CONSTRAINT "Staff_institutionId_fkey"
      FOREIGN KEY ("institutionId") REFERENCES "Institution"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Staff_userId_fkey'
  ) THEN
    ALTER TABLE "Staff"
      ADD CONSTRAINT "Staff_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
