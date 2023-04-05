/*
  Warnings:

  - The `birthday` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "signed_in_at" INTEGER,
ADD COLUMN     "signed_up_at" INTEGER,
DROP COLUMN "birthday",
ADD COLUMN     "birthday" INTEGER;
