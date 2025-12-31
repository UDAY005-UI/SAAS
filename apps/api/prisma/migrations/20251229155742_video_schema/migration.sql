/*
  Warnings:

  - You are about to drop the column `contentUrl` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Lesson` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VideoState" AS ENUM ('READY', 'PROCESSING', 'FAILED');

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "contentUrl",
DROP COLUMN "duration";

-- CreateTable
CREATE TABLE "VideoAsset" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "VideoState" "VideoState" NOT NULL,

    CONSTRAINT "VideoAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoAsset" ADD CONSTRAINT "VideoAsset_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
