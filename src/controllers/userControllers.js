import {
  getUserService,
  updateImageService,
  updateNameService,
} from "../services/userService.js";

export const getCurrentUser = async (req, res) => {
  const result = await getUserService(req.user.user_id);
  res.status(result.status).json(result.body);
};

export const updateProfileImage = async (req, res) => {
  const result = await updateImageService(req.user, req.file);
  res.status(result.status).json(result.body);
};

export const updateUsername = async (req, res) => {
  const result = await updateNameService(req.user.user_id, req.body.username);
  res.status(result.status).json(result.body);
};
