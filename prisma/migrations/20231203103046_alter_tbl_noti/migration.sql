/*
  Warnings:

  - You are about to drop the column `email` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `content` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_email_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "email",
DROP COLUMN "message",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "owner" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_owner_fkey" FOREIGN KEY ("owner") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;
