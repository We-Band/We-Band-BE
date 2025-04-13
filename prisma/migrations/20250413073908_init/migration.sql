-- CreateTable
CREATE TABLE `Club` (
    `club_id` INTEGER NOT NULL AUTO_INCREMENT,
    `club_name` VARCHAR(191) NOT NULL,
    `club_img` VARCHAR(191) NULL,
    `club_leader` INTEGER NOT NULL,
    `club_code` VARCHAR(191) NOT NULL,
    `member_count` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Club_club_code_key`(`club_code`),
    PRIMARY KEY (`club_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClubSchedule` (
    `club_schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `club_id` INTEGER NOT NULL,
    `club_schedule_start` DATETIME(3) NOT NULL,
    `club_schedule_end` DATETIME(3) NOT NULL,
    `club_schedule_title` VARCHAR(191) NULL,
    `club_schedule_place` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ClubSchedule_club_id_club_schedule_start_idx`(`club_id`, `club_schedule_start`),
    PRIMARY KEY (`club_schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClubMember` (
    `club_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`club_id`, `user_id`)
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

-- CreateTable
CREATE TABLE `UserSchedule` (
    `user_schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_schedule_title` VARCHAR(191) NOT NULL,
    `user_schedule_start` DATETIME(3) NOT NULL,
    `user_schedule_end` DATETIME(3) NOT NULL,
    `user_schedule_place` VARCHAR(191) NULL,
    `user_schedule_participants` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserSchedule_user_id_user_schedule_start_idx`(`user_id`, `user_schedule_start`),
    PRIMARY KEY (`user_schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `team_id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_leader` INTEGER NOT NULL,
    `team_name` VARCHAR(191) NOT NULL,
    `team_img` VARCHAR(191) NULL,
    `club_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Team_club_id_idx`(`club_id`),
    PRIMARY KEY (`team_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `team_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`team_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamSchedule` (
    `team_schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_schedule_title` VARCHAR(191) NOT NULL,
    `team_schedule_start` DATETIME(3) NOT NULL,
    `team_schedule_end` DATETIME(3) NOT NULL,
    `team_schedule_place` VARCHAR(191) NULL,
    `team_schedule_participants` VARCHAR(191) NULL,
    `team_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TeamSchedule_team_id_team_schedule_start_idx`(`team_id`, `team_schedule_start`),
    PRIMARY KEY (`team_schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Club` ADD CONSTRAINT `Club_club_leader_fkey` FOREIGN KEY (`club_leader`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Team` ADD CONSTRAINT `Team_team_leader_fkey` FOREIGN KEY (`team_leader`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `WeBandUser`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamSchedule` ADD CONSTRAINT `TeamSchedule_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamSchedule` ADD CONSTRAINT `TeamSchedule_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `WeBandUser`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
