import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUserById = (userId) =>
  prisma.weBandUser.findUnique({
    where: { user_id: userId },
  });

export const updateProfileImgById = (userId, imgUrl) =>
  prisma.weBandUser.update({
    where: { user_id: userId },
    data: { profile_img: imgUrl },
  });

export const updateUsernameById = (userId, username) =>
  prisma.weBandUser.update({
    where: { user_id: userId },
    data: { user_name: username },
  });
