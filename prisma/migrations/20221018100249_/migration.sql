/*
  Warnings:

  - The values [ACTIVE,DEACTIVE,BAN] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVATED', 'DEACTIVATED', 'BANNED');
ALTER TABLE "User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "UserStatus_old";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'ACTIVATED';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
ADD COLUMN     "wallet_address" TEXT,
ALTER COLUMN "status" SET DEFAULT 'ACTIVATED';
