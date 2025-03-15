/*
  Warnings:

  - You are about to drop the `myschedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `myschedule` DROP FOREIGN KEY `MySchedule_user_id_fkey`;

-- DropTable
DROP TABLE `myschedule`;

-- CreateTable
CREATE TABLE `UserSchedule` (
    `user_schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_schedule_title` VARCHAR(191) NOT NULL,
    `user_schedule_time` DATETIME(3) NOT NULL,
    `user_schedule_place` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSchedule` ADD CONSTRAINT `UserSchedule_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
