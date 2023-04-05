/*
  Warnings:

  - You are about to drop the column `linkEmailAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "linkEmailAt",
ADD COLUMN     "linked_email_at" BIGINT;
