/*
  Warnings:

  - You are about to drop the column `two_actor_is_enable` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "two_actor_is_enable",
ADD COLUMN     "two_factor_is_enable" BOOLEAN NOT NULL DEFAULT false;
