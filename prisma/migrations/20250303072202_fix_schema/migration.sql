-- CreateTable
CREATE TABLE `Club` (
    `club_id` INTEGER NOT NULL AUTO_INCREMENT,
    `club_name` VARCHAR(191) NOT NULL,
    `clubLeader` INTEGER NOT NULL,
    `club_code` VARCHAR(191) NOT NULL,
    `member_count` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`club_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClubSchedule` (
    `club_schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `club_id` INTEGER NOT NULL,
    `club_schedule_time` DATETIME(3) NOT NULL,
    `club_schedule_title` VARCHAR(191) NULL,
    `club_schedule_place` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`club_schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClubMember` (
    `club_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`club_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MySchedule` (
    `schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_title` VARCHAR(191) NOT NULL,
    `schedule_time` DATETIME(3) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `schedule_place` VARCHAR(191) NULL,
    `schedule_participated` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `team_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_by` INTEGER NOT NULL,
    `team_name` VARCHAR(191) NOT NULL,
    `club_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`team_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `team_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`team_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamSchedule` (
    `team_schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_schedule_title` VARCHAR(191) NOT NULL,
    `team_schedule_time` DATETIME(3) NOT NULL,
    `schedule_place` VARCHAR(191) NULL,
    `schedule_participated` VARCHAR(191) NULL,
    `team_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`team_schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeBandUser` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `kakao_id` BIGINT NOT NULL,
    `profile_img` VARCHAR(191) NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WeBandUser_kakao_id_key`(`kakao_id`),
    UNIQUE INDEX `WeBandUser_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClubSchedule` ADD CONSTRAINT `ClubSchedule_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClubMember` ADD CONSTRAINT `ClubMember_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClubMember` ADD CONSTRAINT `ClubMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MySchedule` ADD CONSTRAINT `MySchedule_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `Club`(`club_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`team_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamSchedule` ADD CONSTRAINT `TeamSchedule_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`team_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamSchedule` ADD CONSTRAINT `TeamSchedule_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
