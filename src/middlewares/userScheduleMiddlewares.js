export const isMine = async (req, res, next) => {
    try {
        const { userId, userScheduleId } = req.params
        const myId = req.user.user_id;

        
        const isMine = await prisma.userSchedule.findFirst({
            where: {
                user_id: Number(myId),
                user_schedule_id: Number(userScheduleId)
            },
        });

        if (!isMine) {
            logger.info("기능에 접근할 수 없습니다", { userScheduleId }, { myId });
            return res.status(401).json({ message: "해당 기능에 접근할 권한이 없습니다." });
        }

        logger.info("사용자 일정 검증 완료", { userScheduleId }, { myId });
        next();
    } catch (error) {
        logger.error(`사용자 일정 검증 과정 중 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};