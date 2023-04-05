/*
  Warnings:

  - The `created_at` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_at` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `verified_at` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `signed_in_at` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "signed_up_at" SET DATA TYPE BIGINT,
ALTER COLUMN "birthday" SET DATA TYPE BIGINT,
DROP COLUMN "created_at",
ADD COLUMN     "created_at" BIGINT,
DROP COLUMN "updated_at",
ADD COLUMN     "updated_at" BIGINT,
DROP COLUMN "verified_at",
ADD COLUMN     "verified_at" BIGINT,
DROP COLUMN "signed_in_at",
ADD COLUMN     "signed_in_at" BIGINT;
