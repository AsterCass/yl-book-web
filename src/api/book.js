import {serviceShiro} from "@/utils/request.js";

export function bookList(params) {
    return serviceShiro({
        url: `/book/list`,
        params: params,
        method: 'get',
    })
}

// 预约日历：不分页，返回 { list: [预约...], blockList: [{dayOfWeek, startMinute, endMinute}...] }
// startDateStr / endDateStr 为必传（本周一 ~ 本周日，格式 yyyy-MM-dd）
export function bookCalendar(params) {
    return serviceShiro({
        url: `/book/calendar`,
        params: params,
        method: 'get',
    })
}

export function bookCreate(body) {
    return serviceShiro({
        url: `/book/create`,
        data: body,
        method: 'post',
    })
}

export function bookUpdate(id, body) {
    return serviceShiro({
        url: `/book/update/${id}`,
        data: body,
        method: 'post',
    })
}

export function bookDelete(id) {
    return serviceShiro({
        url: `/book/delete/${id}`,
        method: 'delete',
    })
}

export function bookDetail(id) {
    return serviceShiro({
        url: `/book/detail/${id}`,
        method: 'get',
    })
}

// 人工分配/改派雇员：staffId 可选，不传时等价于取消分配
export function bookAssign(id, staffId) {
    const params = {}
    if (staffId) {
        params.staffId = staffId
    }
    return serviceShiro({
        url: `/book/assign/${id}`,
        params: params,
        method: 'post',
    })
}

export function bookCancelAssign(id) {
    return serviceShiro({
        url: `/book/cancelAssign/${id}`,
        method: 'post',
    })
}

// 自动分配（对未分配预约触发系统自动分配雇员）
export function bookReassign(id) {
    return serviceShiro({
        url: `/book/reassign/${id}`,
        method: 'post',
    })
}

// 拖动调整预约：bookTimeStr 必传，staffId 可选（改派）
export function bookAdjust(id, bookTimeStr, staffId) {
    const params = {bookTimeStr}
    if (staffId) {
        params.staffId = staffId
    }
    return serviceShiro({
        url: `/book/adjust/${id}`,
        params: params,
        method: 'post',
    })
}

export function bookEmailList(params) {
    return serviceShiro({
        url: `/book/email/list`,
        params: params,
        method: 'get',
    })
}

export function bookEmailDetail(id) {
    return serviceShiro({
        url: `/book/email/detail/${id}`,
        method: 'get',
    })
}

export function bookEmailReparse(id) {
    return serviceShiro({
        url: `/book/email/reparse/${id}`,
        method: 'post',
    })
}

export function bookEmailGiveup(id) {
    return serviceShiro({
        url: `/book/email/giveup/${id}`,
        method: 'post',
    })
}
