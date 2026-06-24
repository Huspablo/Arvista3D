-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "FloorMaterial" AS ENUM ('CONCRETE', 'PARQUET', 'MARBLE');

-- CreateEnum
CREATE TYPE "LightingPreset" AS ENUM ('WARM', 'NEUTRAL', 'DRAMATIC');

-- CreateEnum
CREATE TYPE "ArtworkType" AS ENUM ('PAINTING', 'SCULPTURE', 'PHOTOGRAPHY', 'OTHER');

-- CreateEnum
CREATE TYPE "ArtworkStatus" AS ENUM ('DRAFT', 'EXPOSED');

-- CreateEnum
CREATE TYPE "DisplayMode" AS ENUM ('WALL_PLANE', 'FLOOR_MODEL');

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "website" TEXT,
    "avatarUrl" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'BASIC',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "templateKey" TEXT NOT NULL DEFAULT 'white-cube-8',
    "wallColor" TEXT,
    "floorMaterial" "FloorMaterial" NOT NULL DEFAULT 'CONCRETE',
    "lightingPreset" "LightingPreset" NOT NULL DEFAULT 'WARM',
    "artistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GallerySlot" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "displayMode" "DisplayMode" NOT NULL,
    "galleryId" TEXT NOT NULL,
    "artworkId" TEXT,

    CONSTRAINT "GallerySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artwork" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "ArtworkType" NOT NULL,
    "status" "ArtworkStatus" NOT NULL DEFAULT 'DRAFT',
    "year" INTEGER,
    "technique" TEXT,
    "edition" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dimWidth" DOUBLE PRECISION,
    "dimHeight" DOUBLE PRECISION,
    "dimDepth" DOUBLE PRECISION,
    "assetOriginalKey" TEXT,
    "assetThumbnail" TEXT,
    "assetGallery" TEXT,
    "assetDetail" TEXT,
    "assetModel" TEXT,
    "artistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_clerkId_key" ON "Artist"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_stripeCustomerId_key" ON "Artist"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_stripeSubscriptionId_key" ON "Artist"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Gallery_slug_key" ON "Gallery"("slug");

-- CreateIndex
CREATE INDEX "Gallery_artistId_idx" ON "Gallery"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "GallerySlot_artworkId_key" ON "GallerySlot"("artworkId");

-- CreateIndex
CREATE INDEX "GallerySlot_galleryId_idx" ON "GallerySlot"("galleryId");

-- CreateIndex
CREATE UNIQUE INDEX "GallerySlot_galleryId_position_key" ON "GallerySlot"("galleryId", "position");

-- CreateIndex
CREATE INDEX "Artwork_artistId_idx" ON "Artwork"("artistId");

-- CreateIndex
CREATE INDEX "Artwork_artistId_status_idx" ON "Artwork"("artistId", "status");

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GallerySlot" ADD CONSTRAINT "GallerySlot_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GallerySlot" ADD CONSTRAINT "GallerySlot_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
