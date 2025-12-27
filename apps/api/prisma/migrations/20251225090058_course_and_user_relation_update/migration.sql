/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `CourseProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseProgressId,moduleId]` on the table `ModuleProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CourseProgress_userId_courseId_key" ON "CourseProgress"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleProgress_courseProgressId_moduleId_key" ON "ModuleProgress"("courseProgressId", "moduleId");
