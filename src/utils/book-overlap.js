// 日历拖动时与目标雇员已有预约的服务时间重叠判定（2026-10-22）。
//
// 口径与后端 BookServiceImpl.validateStaffNoConflict 给管理端的那一档一致：同一位雇员、状态为已分配 / 进行中 / 已完成、
// 排除拖动的单本身、[开始, 结束) 相交（首尾正好相接不算）。只看服务时间——整理时间、休息围栏在管理端只提示
// （/book/precheck），屏蔽时段与排班由调用方另查。
// 时间用日历已解析好的 _dateStr（'yyyy-MM-dd'）与当日分钟 _start / _end（见 ZyyBookCalendar 的 enrichBooking）。
// 不引用 BookStatusEnum（它走 @ 别名），状态码直接写在这里，与它的 WORK / IN_PROGRESS / DONE 对应。

/** 占着雇员时段的状态：已分配 1、进行中 2、已完成 3（待分配、已过期、已取消不占）。 */
export const OCCUPYING_STATUS_CODES = [1, 2, 3]

/**
 * 目标雇员在 [start, end) 里与拖动落点重叠的预约，按开始时间升序。
 *
 * @param bookings 日历已加载的预约（含已取消的也无妨，按状态滤掉）
 * @param target {bookingId, staffId, dateStr, start, end}：拖动的单、目标雇员、落点日期与当日分钟
 * @return 重叠的预约；staffId 为空（拖进「未分配」列）时返回空数组
 */
export function overlappingBookings(bookings, target) {
    if (!target || !target.staffId) {
        return []
    }
    return (bookings || [])
        .filter(b => b && b.id !== target.bookingId
            && b.staffId === target.staffId
            && OCCUPYING_STATUS_CODES.includes(b.status)
            && b._dateStr === target.dateStr
            && b._start < target.end && target.start < b._end)
        .sort((a, b) => a._start - b._start)
}

/**
 * 预约是否已开始：状态已是进行中 / 已完成，或按浏览器本地时间（同日历的当前时间线）已到开始时刻。
 * 已开始的单拖到未分配后，后端会按「没有雇员 + 时间已过」把它算成已过期，弹框据此提前说明。
 *
 * @param nowDateStr 当前日期 'yyyy-MM-dd'
 * @param nowMinutes 当前时刻的当日分钟
 */
export function bookingStarted(b, nowDateStr, nowMinutes) {
    if (b.status === 2 || b.status === 3) {
        return true
    }
    return b._dateStr < nowDateStr || (b._dateStr === nowDateStr && b._start <= nowMinutes)
}
