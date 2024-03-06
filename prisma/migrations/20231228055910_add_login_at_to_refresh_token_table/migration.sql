/*
  Warnings:

  - You are about to drop the column `exp` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `iat` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `loginAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "exp",
DROP COLUMN "iat",
ADD COLUMN     "loginAt" BIGINT NOT NULL;
