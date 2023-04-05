/*
  Warnings:

  - The `signed_in_at` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `status` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "verified_at" TIMESTAMP(3),
ALTER COLUMN "status" SET NOT NULL,
DROP COLUMN "signed_in_at",
ADD COLUMN     "signed_in_at" TIMESTAMP(3),
ALTER COLUMN "state" DROP NOT NULL;
