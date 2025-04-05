/*
  Warnings:

  - You are about to drop the column `created_by` on the `team` table. All the data in the column will be lost.
  - You are about to drop the column `team_schedule_participated` on the `teamschedule` table. All the data in the column will be lost.
  - Added the required column `team_leader` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `team` DROP FOREIGN KEY `Team_created_by_fkey`;

-- DropIndex
DROP INDEX `Team_created_by_fkey` ON `team`;

-- DropIndex
DROP INDEX `Team_team_id_club_id_idx` ON `team`;

-- AlterTable
ALTER TABLE `team` DROP COLUMN `created_by`,
    ADD COLUMN `team_img` VARCHAR(191) NULL,
    ADD COLUMN `team_leader` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `teamschedule` DROP COLUMN `team_schedule_participated`,
    ADD COLUMN `team_schedule_participants` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `userschedule` ADD COLUMN `user_schedule_participants` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Club` ADD CONSTRAINT `Club_club_leader_fkey` FOREIGN KEY (`club_leader`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_team_leader_fkey` FOREIGN KEY (`team_leader`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `team` RENAME INDEX `Team_club_id_fkey` TO `Team_club_id_idx`;
