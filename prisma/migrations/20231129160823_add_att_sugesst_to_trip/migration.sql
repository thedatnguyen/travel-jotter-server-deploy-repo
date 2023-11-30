-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "suggest" TEXT,
ADD COLUMN     "suggestGenerated" BOOLEAN NOT NULL DEFAULT false;
