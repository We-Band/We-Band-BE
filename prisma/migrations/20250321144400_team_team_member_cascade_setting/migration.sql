-- DropForeignKey
ALTER TABLE `teammember` DROP FOREIGN KEY `TeamMember_team_id_fkey`;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;
