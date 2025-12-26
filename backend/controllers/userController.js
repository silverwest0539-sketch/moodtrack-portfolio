const pool = require('../server/config/database')

// 사용자 프로필 조회
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.session.user.userId

        const [userRows] = await pool.query(
            `
            SELECT NICKNAME, STREAK_DAYS, LOGIN_ID, EMAIL
              FROM USERS
             WHERE USER_ID = ?
            `,
            [userId]
        )

        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            })
        }

        res.json({
            success: true,
            nickname: userRows[0].NICKNAME,
            streak: userRows[0].STREAK_DAYS || 0,
            loginid: userRows[0].LOGIN_ID,
            email: userRows[0].EMAIL
        })

    } catch (error) {
        console.error('프로필 조회 에러:', error)
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        })
    }
}