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

export function bookSpecialRemarkCreate(body) {
    return serviceShiro({
        url: `/book/specialRemark/create`,
        data: body,
        method: 'post',
    })
}

// 门店特殊备注简单列表：返回本门店全部备注文案（字符串数组）
export function bookSpecialRemarkListSimple() {
    return serviceShiro({
        url: `/book/specialRemark/list/simple`,
        method: 'get',
    })
}

// 客户历史：按手机号模糊搜索，返回最多 10 个客户（按手机号聚合），
// 每个客户含总预约次数与最近 3 次预约（含已取消，附时间/项目/来源）
export function bookCustomerHistory(phone) {
    return serviceShiro({
        url: `/book/customer/history`,
        params: {phone: phone},
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
