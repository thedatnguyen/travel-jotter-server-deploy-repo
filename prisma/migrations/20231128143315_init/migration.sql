-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'not_defined');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('sightseeing', 'foods_and_drinks', 'cafe', 'sport', 'transportation', 'lodging', 'others');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TripJournal', 'OtherPost');

-- CreateEnum
CREATE TYPE "TripRole" AS ENUM ('member', 'owner');

-- CreateTable
CREATE TABLE "PendingAccount" (
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,

    CONSTRAINT "PendingAccount_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Account" (
    "accountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "chatAccountId" INTEGER NOT NULL,
    "pictureId" TEXT NOT NULL,
    "pictureUrl" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "email" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "iat" BIGINT NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "SharedTrip" (
    "email" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "role" "TripRole" NOT NULL,

    CONSTRAINT "SharedTrip_pkey" PRIMARY KEY ("email","tripId")
);

-- CreateTable
CREATE TABLE "Trip" (
    "tripId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "locations" TEXT[],
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "coverPictureId" TEXT,
    "coverPictureUrl" TEXT,
    "actualBudget" INTEGER NOT NULL DEFAULT 0,
    "expectedBudget" INTEGER NOT NULL DEFAULT 0,
    "lodging" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("tripId")
);

-- CreateTable
CREATE TABLE "TripPicture" (
    "pictureId" TEXT NOT NULL,
    "pictureUrl" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "activityId" TEXT,

    CONSTRAINT "TripPicture_pkey" PRIMARY KEY ("pictureId")
);

-- CreateTable
CREATE TABLE "TimeSection" (
    "timeSectionId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSection_pkey" PRIMARY KEY ("timeSectionId")
);

-- CreateTable
CREATE TABLE "Activity" (
    "activityId" TEXT NOT NULL,
    "timeSectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "budget" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL DEFAULT 'no location',
    "category" "Category" NOT NULL DEFAULT 'others',
    "order" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("activityId")
);

-- CreateTable
CREATE TABLE "WishActivity" (
    "tripId" TEXT NOT NULL,
    "wishActivityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "budget" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL DEFAULT 'no location',
    "category" "Category" NOT NULL DEFAULT 'others',
    "dateCreate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishActivity_pkey" PRIMARY KEY ("wishActivityId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "commentId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId")
);

-- CreateTable
CREATE TABLE "Post" (
    "postId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "postType" "PostType" NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("postId")
);

-- CreateTable
CREATE TABLE "TripJournal" (
    "postId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,

    CONSTRAINT "TripJournal_pkey" PRIMARY KEY ("postId","tripId")
);

-- CreateTable
CREATE TABLE "OtherPostPicture" (
    "pictureId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "pictureUrl" TEXT NOT NULL,

    CONSTRAINT "OtherPostPicture_pkey" PRIMARY KEY ("pictureId")
);

-- CreateTable
CREATE TABLE "Follow" (
    "following" TEXT NOT NULL,
    "follower" TEXT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("follower","following")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notificationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountId_key" ON "Account"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_email_fkey" FOREIGN KEY ("email") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedTrip" ADD CONSTRAINT "SharedTrip_email_fkey" FOREIGN KEY ("email") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedTrip" ADD CONSTRAINT "SharedTrip_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_owner_fkey" FOREIGN KEY ("owner") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPicture" ADD CONSTRAINT "TripPicture_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("activityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPicture" ADD CONSTRAINT "TripPicture_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSection" ADD CONSTRAINT "TimeSection_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_timeSectionId_fkey" FOREIGN KEY ("timeSectionId") REFERENCES "TimeSection"("timeSectionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishActivity" ADD CONSTRAINT "WishActivity_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("activityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_author_fkey" FOREIGN KEY ("author") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_author_fkey" FOREIGN KEY ("author") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripJournal" ADD CONSTRAINT "TripJournal_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripJournal" ADD CONSTRAINT "TripJournal_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherPostPicture" ADD CONSTRAINT "OtherPostPicture_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_email_fkey" FOREIGN KEY ("email") REFERENCES "Account"("email") ON DELETE CASCADE ON UPDATE CASCADE;
