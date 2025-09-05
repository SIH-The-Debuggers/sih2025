-- CreateTable
CREATE TABLE "TouristIdentity" (
    "id" TEXT NOT NULL,
    "subjectAddr" TEXT NOT NULL,
    "didUri" TEXT NOT NULL,
    "anchorHash" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "registerTx" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encPIIRef" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "contactsMin" TEXT NOT NULL,

    CONSTRAINT "TouristIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TouristIdentity_subjectAddr_key" ON "TouristIdentity"("subjectAddr");

-- CreateIndex
CREATE INDEX "TouristIdentity_anchorHash_idx" ON "TouristIdentity"("anchorHash");
