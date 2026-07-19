-- CreateTable
CREATE TABLE "GoogleToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GoogleDriveLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "webUrl" TEXT NOT NULL,
    "linkedBy" TEXT NOT NULL,
    "linkedAt" TEXT NOT NULL,
    "lastSyncedAt" TEXT NOT NULL,
    "lastModifiedAt" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveLink_fileId_key" ON "GoogleDriveLink"("fileId");
