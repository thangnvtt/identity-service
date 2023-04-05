/*
  Warnings:

  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserState" AS ENUM ('INIT', 'CREATED', 'UPDATED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT NOT NULL;
