-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'SALES_MANAGER', 'CONTENT_MANAGER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'USED', 'RECONDITIONED');

-- CreateEnum
CREATE TYPE "Origin" AS ENUM ('LOCAL', 'IMPORTED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'NEGOTIATION', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "TestDriveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CONTENT_MANAGER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'General',

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "modelId" TEXT,
    "categoryId" TEXT,
    "price" DECIMAL(14,0) NOT NULL,
    "priceNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "engineCc" INTEGER,
    "transmission" TEXT NOT NULL DEFAULT 'Automatic',
    "fuelType" TEXT NOT NULL DEFAULT 'Petrol',
    "bodyType" TEXT,
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "condition" "Condition" NOT NULL DEFAULT 'USED',
    "city" TEXT,
    "registrationCity" TEXT,
    "description" TEXT,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "soldAt" TIMESTAMP(3),
    "origin" "Origin" NOT NULL DEFAULT 'LOCAL',
    "auctionGrade" TEXT,
    "importYear" INTEGER,
    "registrationYear" INTEGER,
    "originalMileage" INTEGER,
    "verifiedMileage" INTEGER,
    "tokenTaxInfo" TEXT,
    "customsDetails" TEXT,
    "auctionSheetUrl" TEXT,
    "specs" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleImage" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleFeature" (
    "vehicleId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "VehicleFeature_pkey" PRIMARY KEY ("vehicleId","featureId")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "vehicleId" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'Website',
    "type" TEXT NOT NULL DEFAULT 'INQUIRY',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'Website',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestDrive" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT,
    "message" TEXT,
    "status" "TestDriveStatus" NOT NULL DEFAULT 'PENDING',
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatarUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverUrl" TEXT,
    "author" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "system" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "showInFooter" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsSection" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL DEFAULT 'home',
    "type" TEXT NOT NULL,
    "title" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "publicId" TEXT,
    "filename" TEXT NOT NULL,
    "alt" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "NavItem" (
    "id" TEXT NOT NULL,
    "menu" TEXT NOT NULL DEFAULT 'header',
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NavItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "CarModel_brandId_idx" ON "CarModel"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_brandId_slug_key" ON "CarModel"("brandId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "Feature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_slug_key" ON "Vehicle"("slug");

-- CreateIndex
CREATE INDEX "Vehicle_published_status_deletedAt_idx" ON "Vehicle"("published", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Vehicle_brandId_idx" ON "Vehicle"("brandId");

-- CreateIndex
CREATE INDEX "Vehicle_categoryId_idx" ON "Vehicle"("categoryId");

-- CreateIndex
CREATE INDEX "Vehicle_price_idx" ON "Vehicle"("price");

-- CreateIndex
CREATE INDEX "Vehicle_year_idx" ON "Vehicle"("year");

-- CreateIndex
CREATE INDEX "Vehicle_featured_idx" ON "Vehicle"("featured");

-- CreateIndex
CREATE INDEX "Vehicle_createdAt_idx" ON "Vehicle"("createdAt");

-- CreateIndex
CREATE INDEX "VehicleImage_vehicleId_position_idx" ON "VehicleImage"("vehicleId", "position");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_assigneeId_idx" ON "Lead"("assigneeId");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "Inquiry_leadId_idx" ON "Inquiry"("leadId");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_idx" ON "LeadNote"("leadId");

-- CreateIndex
CREATE INDEX "TestDrive_status_idx" ON "TestDrive"("status");

-- CreateIndex
CREATE INDEX "TestDrive_preferredDate_idx" ON "TestDrive"("preferredDate");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_published_publishedAt_idx" ON "BlogPost"("published", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "CmsSection_page_sortOrder_idx" ON "CmsSection"("page", "sortOrder");

-- CreateIndex
CREATE INDEX "Media_folder_idx" ON "Media"("folder");

-- CreateIndex
CREATE INDEX "Media_filename_idx" ON "Media"("filename");

-- CreateIndex
CREATE INDEX "NavItem_menu_sortOrder_idx" ON "NavItem"("menu", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entity_entityId_idx" ON "ActivityLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "CarModel" ADD CONSTRAINT "CarModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleFeature" ADD CONSTRAINT "VehicleFeature_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleFeature" ADD CONSTRAINT "VehicleFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDrive" ADD CONSTRAINT "TestDrive_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
