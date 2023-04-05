/*
  Warnings:

  - You are about to drop the column `two_factor_is_enable` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "two_factor_is_enable",
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL,
ALTER COLUMN "is_admin" DROP NOT NULL;
