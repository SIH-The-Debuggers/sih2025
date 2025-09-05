/*
  Warnings:

  - A unique constraint covering the columns `[subjectAddr,tripId]` on the table `TouristIdentity` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TouristIdentity_subjectAddr_key";

-- CreateIndex
CREATE INDEX "TouristIdentity_subjectAddr_idx" ON "TouristIdentity"("subjectAddr");

-- CreateIndex
CREATE UNIQUE INDEX "TouristIdentity_subjectAddr_tripId_key" ON "TouristIdentity"("subjectAddr", "tripId");
