-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorAuthenticationSecret" TEXT,
ADD COLUMN     "twoFactorIsEnable" BOOLEAN NOT NULL DEFAULT false;
