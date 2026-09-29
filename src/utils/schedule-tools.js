// 雇员周排班的判定工具：预约日历（排班外预约标记）与雇员编辑页（改排班前的影响提示）共用。
//
// 排班数据形如 [{dayOfWeek: 1~7, startMinute, endMinute}]（1=周一，end 不含），即 /staff/list/simple
// 返回的 scheduleList，也是雇员保存时提交的 scheduleList。
//
// ⚠️ 判定口径必须与后端自动分配一致，否则前端标出来的和系统实际能不能排对不上：
//   ① 同一天的班次先「合并重叠/相邻段」（后端保存排班时就是这么合并的：10-14 + 14-18 存成 10-18）；
//   ② 必须有<b>一段</b>班次完整覆盖整张单（start >= 班次起点 且 end <= 班次终点）——两段中间有空档时，
//      横跨空档的单不算被覆盖。

/**
 * 日期串（yyyy-MM-dd 开头）对应的星期几，1=周一 ~ 7=周日；取不出返回 0。
 * 只从年/月/日三个数字算，不做任何时区换算：预约时间是门店墙钟，
 * 用 new Date('2026-09-17') 这种纯日期串会按 UTC 解析，在负时区会退回前一天。
 */
export function isoWeekdayOfDateStr(dateStr) {
    if (!dateStr || dateStr.length < 10) {
        return 0
    }
    const year = Number(dateStr.substring(0, 4))
    const month = Number(dateStr.substring(5, 7))
    const day = Number(dateStr.substring(8, 10))
    if (!year || !month || !day) {
        return 0
    }
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
    return dayOfWeek === 0 ? 7 : dayOfWeek
}

/**
 * 某个星期几的班次（分钟），按开始时间排序并合并重叠/相邻段。一天可能有多段，所以返回数组。
 */
export function mergedShifts(scheduleList, dayOfWeek) {
    const raw = (scheduleList || [])
        .filter(sc => Number(sc.dayOfWeek) === dayOfWeek
            && sc.startMinute != null && sc.endMinute != null
            && Number(sc.endMinute) > Number(sc.startMinute))
        .map(sc => ({start: Number(sc.startMinute), end: Number(sc.endMinute)}))
        .sort((a, b) => a.start - b.start)
    const merged = []
    for (const seg of raw) {
        const last = merged[merged.length - 1]
        if (last && seg.start <= last.end) {
            last.end = Math.max(last.end, seg.end)
        } else {
            merged.push({...seg})
        }
    }
    return merged
}

/**
 * 排班是否覆盖某星期几的 [startMinute, endMinute)：必须有一段班次完整覆盖。
 * 跨零点的单（endMinute > 1440）不可能被覆盖，与后端一致。
 */
export function scheduleCovers(scheduleList, dayOfWeek, startMinute, endMinute) {
    return mergedShifts(scheduleList, dayOfWeek)
        .some(seg => seg.start <= startMinute && seg.end >= endMinute)
}

/**
 * 预约在某份排班下是否「排班外」。
 *
 * @param booking 需带 bookingTime（yyyy-MM-dd HH:mm）与 requiredSkillTime（分钟）
 * @return true = 当天没有任何一段班次能完整覆盖这张单；预约时间取不出时返回 false（不判定、不误报）
 */
export function isBookingOutsideSchedule(booking, scheduleList) {
    if (!booking || !booking.bookingTime || booking.bookingTime.length < 16) {
        return false
    }
    const dayOfWeek = isoWeekdayOfDateStr(booking.bookingTime)
    const hour = Number(booking.bookingTime.substring(11, 13))
    const minute = Number(booking.bookingTime.substring(14, 16))
    if (!dayOfWeek || Number.isNaN(hour) || Number.isNaN(minute)) {
        return false
    }
    const start = hour * 60 + minute
    // 时长缺失时按 60 分钟算，与预约日历画卡片高度的口径一致
    const duration = booking.requiredSkillTime > 0 ? Number(booking.requiredSkillTime) : 60
    return !scheduleCovers(scheduleList, dayOfWeek, start, start + duration)
}

/**
 * 班次展示文本，如「10:00-17:00, 18:00-22:00」；当天无班次返回空串。
 */
export function formatShifts(shifts) {
    const hm = minute => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
    return (shifts || []).map(seg => `${hm(seg.start)}-${hm(seg.end)}`).join(', ')
}
