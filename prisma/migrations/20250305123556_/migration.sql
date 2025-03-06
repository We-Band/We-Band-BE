/*
  Warnings:

  - A unique constraint covering the columns `[club_code]` on the table `Club` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Club_club_code_key` ON `Club`(`club_code`);
