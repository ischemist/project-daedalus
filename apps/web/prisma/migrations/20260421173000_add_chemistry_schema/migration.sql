-- CreateEnum
CREATE TYPE "VendorSource" AS ENUM ('MCULE', 'LABNETWORK', 'EMOLECULES', 'SIGMA_ALDRICH', 'CHEMBRIDGE');

-- CreateTable
CREATE TABLE "Molecule" (
    "id" TEXT NOT NULL,
    "inchikey" TEXT NOT NULL,
    "inchi" TEXT,
    "inchikeyNoStereo" TEXT,
    "inchikeyConnectivity" TEXT,
    "canonicalSmiles" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Molecule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "canonicalizerVersion" INTEGER NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReactionInput" (
    "id" TEXT NOT NULL,
    "reactionId" TEXT NOT NULL,
    "moleculeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "stoichiometry" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ReactionInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "canonicalizerVersion" INTEGER NOT NULL DEFAULT 1,
    "rootMoleculeId" TEXT NOT NULL,
    "rootNodeId" TEXT,
    "length" INTEGER NOT NULL,
    "hasConvergentReaction" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteNode" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "moleculeId" TEXT NOT NULL,
    "nodeIndex" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "subtreeSignature" TEXT NOT NULL,
    "subtreeCanonicalizerVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RouteNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStep" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "reactionId" TEXT NOT NULL,
    "productNodeId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,

    CONSTRAINT "RouteStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStepInput" (
    "id" TEXT NOT NULL,
    "routeStepId" TEXT NOT NULL,
    "routeNodeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "RouteStepInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockSnapshot" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "label" TEXT,
    "membershipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL,
    "stockSnapshotId" TEXT NOT NULL,
    "moleculeId" TEXT NOT NULL,
    "ppg" DOUBLE PRECISION,
    "source" "VendorSource",
    "leadTime" TEXT,
    "link" TEXT,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Molecule_inchikey_key" ON "Molecule"("inchikey");

-- CreateIndex
CREATE INDEX "Molecule_canonicalSmiles_idx" ON "Molecule"("canonicalSmiles");

-- CreateIndex
CREATE INDEX "Molecule_inchikeyNoStereo_idx" ON "Molecule"("inchikeyNoStereo");

-- CreateIndex
CREATE INDEX "Molecule_inchikeyConnectivity_idx" ON "Molecule"("inchikeyConnectivity");

-- CreateIndex
CREATE INDEX "Reaction_signature_idx" ON "Reaction"("signature");

-- CreateIndex
CREATE INDEX "Reaction_productId_idx" ON "Reaction"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_canonicalizerVersion_signature_key" ON "Reaction"("canonicalizerVersion", "signature");

-- CreateIndex
CREATE INDEX "ReactionInput_moleculeId_idx" ON "ReactionInput"("moleculeId");

-- CreateIndex
CREATE INDEX "ReactionInput_reactionId_moleculeId_idx" ON "ReactionInput"("reactionId", "moleculeId");

-- CreateIndex
CREATE UNIQUE INDEX "ReactionInput_reactionId_position_key" ON "ReactionInput"("reactionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Route_rootNodeId_key" ON "Route"("rootNodeId");

-- CreateIndex
CREATE INDEX "Route_signature_idx" ON "Route"("signature");

-- CreateIndex
CREATE INDEX "Route_rootMoleculeId_idx" ON "Route"("rootMoleculeId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_canonicalizerVersion_signature_key" ON "Route"("canonicalizerVersion", "signature");

-- CreateIndex
CREATE INDEX "RouteNode_moleculeId_idx" ON "RouteNode"("moleculeId");

-- CreateIndex
CREATE INDEX "RouteNode_routeId_moleculeId_idx" ON "RouteNode"("routeId", "moleculeId");

-- CreateIndex
CREATE INDEX "RouteNode_routeId_depth_idx" ON "RouteNode"("routeId", "depth");

-- CreateIndex
CREATE INDEX "RouteNode_subtreeCanonicalizerVersion_subtreeSignature_idx" ON "RouteNode"("subtreeCanonicalizerVersion", "subtreeSignature");

-- CreateIndex
CREATE UNIQUE INDEX "RouteNode_routeId_nodeIndex_key" ON "RouteNode"("routeId", "nodeIndex");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStep_productNodeId_key" ON "RouteStep"("productNodeId");

-- CreateIndex
CREATE INDEX "RouteStep_reactionId_idx" ON "RouteStep"("reactionId");

-- CreateIndex
CREATE INDEX "RouteStep_routeId_reactionId_idx" ON "RouteStep"("routeId", "reactionId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStep_routeId_stepIndex_key" ON "RouteStep"("routeId", "stepIndex");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStepInput_routeNodeId_key" ON "RouteStepInput"("routeNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStepInput_routeStepId_position_key" ON "RouteStepInput"("routeStepId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_name_key" ON "Stock"("name");

-- CreateIndex
CREATE INDEX "StockSnapshot_membershipHash_idx" ON "StockSnapshot"("membershipHash");

-- CreateIndex
CREATE UNIQUE INDEX "StockSnapshot_stockId_version_key" ON "StockSnapshot"("stockId", "version");

-- CreateIndex
CREATE INDEX "StockItem_stockSnapshotId_source_ppg_idx" ON "StockItem"("stockSnapshotId", "source", "ppg");

-- CreateIndex
CREATE INDEX "StockItem_stockSnapshotId_ppg_idx" ON "StockItem"("stockSnapshotId", "ppg");

-- CreateIndex
CREATE INDEX "StockItem_moleculeId_idx" ON "StockItem"("moleculeId");

-- CreateIndex
CREATE UNIQUE INDEX "StockItem_stockSnapshotId_moleculeId_key" ON "StockItem"("stockSnapshotId", "moleculeId");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Molecule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionInput" ADD CONSTRAINT "ReactionInput_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionInput" ADD CONSTRAINT "ReactionInput_moleculeId_fkey" FOREIGN KEY ("moleculeId") REFERENCES "Molecule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_rootMoleculeId_fkey" FOREIGN KEY ("rootMoleculeId") REFERENCES "Molecule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_rootNodeId_fkey" FOREIGN KEY ("rootNodeId") REFERENCES "RouteNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteNode" ADD CONSTRAINT "RouteNode_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteNode" ADD CONSTRAINT "RouteNode_moleculeId_fkey" FOREIGN KEY ("moleculeId") REFERENCES "Molecule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStep" ADD CONSTRAINT "RouteStep_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStep" ADD CONSTRAINT "RouteStep_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStep" ADD CONSTRAINT "RouteStep_productNodeId_fkey" FOREIGN KEY ("productNodeId") REFERENCES "RouteNode"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStepInput" ADD CONSTRAINT "RouteStepInput_routeStepId_fkey" FOREIGN KEY ("routeStepId") REFERENCES "RouteStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStepInput" ADD CONSTRAINT "RouteStepInput_routeNodeId_fkey" FOREIGN KEY ("routeNodeId") REFERENCES "RouteNode"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockSnapshot" ADD CONSTRAINT "StockSnapshot_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_stockSnapshotId_fkey" FOREIGN KEY ("stockSnapshotId") REFERENCES "StockSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_moleculeId_fkey" FOREIGN KEY ("moleculeId") REFERENCES "Molecule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
