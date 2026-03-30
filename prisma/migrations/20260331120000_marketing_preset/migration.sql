-- CreateTable
CREATE TABLE "MarketingPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "campaignLabel" TEXT,
    "copyVariant" TEXT NOT NULL,
    "includeHashtags" BOOLEAN NOT NULL DEFAULT true,
    "includeKeywords" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketingPreset_userId_idx" ON "MarketingPreset"("userId");

-- CreateIndex
CREATE INDEX "MarketingPreset_userId_isDefault_idx" ON "MarketingPreset"("userId", "isDefault");

-- AddForeignKey
ALTER TABLE "MarketingPreset" ADD CONSTRAINT "MarketingPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
