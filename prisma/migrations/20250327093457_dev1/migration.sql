/*
  Warnings:

  - You are about to drop the column `club_schedule_time` on the `clubschedule` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_participated` on the `teamschedule` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_place` on the `teamschedule` table. All the data in the column will be lost.
  - You are about to drop the column `team_schedule_time` on the `teamschedule` table. All the data in the column will be lost.
  - You are about to drop the column `user_schedule_time` on the `userschedule` table. All the data in the column will be lost.
  - Added the required column `club_schedule_end` to the `ClubSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `club_schedule_start` to the `ClubSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_schedule_end` to the `TeamSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_schedule_start` to the `TeamSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_schedule_end` to the `UserSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_schedule_start` to the `UserSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clubschedule` DROP COLUMN `club_schedule_time`,
    ADD COLUMN `club_schedule_end` DATETIME(3) NOT NULL,
    ADD COLUMN `club_schedule_start` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `teamschedule` DROP COLUMN `schedule_participated`,
    DROP COLUMN `schedule_place`,
    DROP COLUMN `team_schedule_time`,
    ADD COLUMN `team_schedule_end` DATETIME(3) NOT NULL,
    ADD COLUMN `team_schedule_participated` VARCHAR(191) NULL,
    ADD COLUMN `team_schedule_place` VARCHAR(191) NULL,
    ADD COLUMN `team_schedule_start` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `userschedule` DROP COLUMN `user_schedule_time`,
    ADD COLUMN `user_schedule_end` DATETIME(3) NOT NULL,
    ADD COLUMN `user_schedule_start` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `ClubSchedule_club_id_club_schedule_start_idx` ON `ClubSchedule`(`club_id`, `club_schedule_start`);

-- CreateIndex
CREATE INDEX `TeamSchedule_team_id_team_schedule_start_idx` ON `TeamSchedule`(`team_id`, `team_schedule_start`);

-- CreateIndex
CREATE INDEX `UserSchedule_user_id_user_schedule_start_idx` ON `UserSchedule`(`user_id`, `user_schedule_start`);
