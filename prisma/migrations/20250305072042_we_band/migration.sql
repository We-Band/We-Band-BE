/*
  Warnings:

  - You are about to drop the column `clubLeader` on the `club` table. All the data in the column will be lost.
  - Added the required column `club_leader` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `club` DROP COLUMN `clubLeader`,
    ADD COLUMN `club_leader` INTEGER NOT NULL;
