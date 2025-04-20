import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const userRepository = {
  getUserById: async (userId) => {
    return await prisma.weBandUser.findUnique({
      where: { user_id: userId },
    });
  },

  updateProfileImgById: async (userId, imgUrl) => {
    return await prisma.weBandUser.update({
      where: { user_id: userId },
      data: { profile_img: imgUrl },
    });
  },

  updateUsernameById: async (userId, username) => {
    return await prisma.weBandUser.update({
      where: { user_id: userId },
      data: { user_name: username },
    });
  },
};
