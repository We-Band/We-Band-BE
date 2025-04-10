import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const userRepository = {
  getUserById: async (userId) => {
    prisma.weBandUser.findUnique({
      where: { user_id: userId },
    });
  },

  updateProfileImgById: async (userId, imgUrl) => {
    prisma.weBandUser.update({
      where: { user_id: userId },
      data: { profile_img: imgUrl },
    });
  },

  updateUsernameById: async (userId, username) => {
    prisma.weBandUser.update({
      where: { user_id: userId },
      data: { user_name: username },
    });
  },
};
