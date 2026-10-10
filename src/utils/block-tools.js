// 屏蔽时段（block）的区间工具。
//
// 时间一律是门店墙钟串 'yyyy-MM-dd HH:mm'（后端 BlockDto 的出参、新建 block 的入参都是这个格式）：
// 定长、零填充，字典序就是时间序，所以直接比字符串——不解析成 Date，也就不涉及时区。

/**
 * [startStr, endStr) 里还没被 covered 覆盖的空档（左闭右开，按时间升序）。
 * 「今日下班」用它算要补建哪几段门店屏蔽。
 * <p>
 * covered 不要求有序，可以互相重叠、相接，也可以超出 [startStr, endStr)。
 * 例：18:00 ~ 次日 00:00，已有 20:00 ~ 22:00 → 18:00 ~ 20:00 与 22:00 ~ 次日 00:00 两段。
 *
 * @param covered [{startTime, endTime}]
 * @return [{startTimeStr, endTimeStr}]，可直接作新建 block 的入参；全被覆盖返回空数组
 */
export function uncoveredRanges(startStr, endStr, covered) {
    const ranges = []
    if (!startStr || !endStr || startStr >= endStr) {
        return ranges
    }
    const sorted = (covered || [])
        .filter(c => c && c.startTime && c.endTime && c.endTime > c.startTime)
        .sort((a, b) => (a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0))
    // cursor 之前的部分已处理完（要么已输出为空档，要么被覆盖）
    let cursor = startStr
    for (const c of sorted) {
        if (c.endTime <= cursor) {
            continue
        }
        if (c.startTime >= endStr) {
            break
        }
        if (c.startTime > cursor) {
            ranges.push({startTimeStr: cursor, endTimeStr: c.startTime})
        }
        cursor = c.endTime
        if (cursor >= endStr) {
            break
        }
    }
    if (cursor < endStr) {
        ranges.push({startTimeStr: cursor, endTimeStr: endStr})
    }
    return ranges
}
