-- DropForeignKey
ALTER TABLE `clubmember` DROP FOREIGN KEY `ClubMember_club_id_fkey`;

-- DropForeignKey
ALTER TABLE `clubmember` DROP FOREIGN KEY `ClubMember_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `clubschedule` DROP FOREIGN KEY `ClubSchedule_club_id_fkey`;

-- DropForeignKey
ALTER TABLE `team` DROP FOREIGN KEY `Team_club_id_fkey`;

-- DropForeignKey
ALTER TABLE `teammember` DROP FOREIGN KEY `TeamMember_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `teamschedule` DROP FOREIGN KEY `TeamSchedule_team_id_fkey`;

-- DropForeignKey
ALTER TABLE `userschedule` DROP FOREIGN KEY `UserSchedule_user_id_fkey`;

-- DropIndex
DROP INDEX `ClubMember_user_id_fkey` ON `clubmember`;

-- DropIndex
DROP INDEX `Team_club_id_fkey` ON `team`;

-- DropIndex
DROP INDEX `TeamMember_user_id_fkey` ON `teammember`;

-- AlterTable
ALTER TABLE `club` ADD COLUMN `club_img` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `clubmember` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `teammember` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `Team_team_id_club_id_idx` ON `Team`(`team_id`, `club_id`);

-- AddForeignKey
ALTER TABLE `ClubSchedule` ADD CONSTRAINT `ClubSchedule_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClubMember` ADD CONSTRAINT `ClubMember_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClubMember` ADD CONSTRAINT `ClubMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `WeBandUser`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSchedule` ADD CONSTRAINT `UserSchedule_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `WeBandUser`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `WeBandUser`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamSchedule` ADD CONSTRAINT `TeamSchedule_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;
