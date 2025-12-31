/*
  Warnings:

  - A unique constraint covering the columns `[lessonId]` on the table `VideoAsset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VideoAsset_lessonId_key" ON "VideoAsset"("lessonId");
