-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "nrs_customer" TEXT NOT NULL,
    "elmer_number" TEXT,
    "nrs_pay_mid" TEXT,
    "legal_name" TEXT NOT NULL,
    "dba" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "date_started" TEXT NOT NULL,
    "state_of_incorporation" TEXT NOT NULL,
    "federal_tax_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "business_tel" TEXT,
    "email" TEXT NOT NULL,
    "owners" JSONB NOT NULL,
    "notes" TEXT,
    "submitted_ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "mfa_secret" TEXT,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_app_id_key" ON "applications"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- Sequence backing guaranteed-unique, human-friendly application IDs (APP-000001, ...).
-- Also created idempotently at server boot (see server/src/db.ts) as a defense-in-depth safety net.
CREATE SEQUENCE IF NOT EXISTS "application_seq" START WITH 1 INCREMENT BY 1;
