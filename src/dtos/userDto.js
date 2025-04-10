export const serializeUserDto = (user) => ({
  ...user,
  kakao_id: user.kakao_id.toString(),
});
