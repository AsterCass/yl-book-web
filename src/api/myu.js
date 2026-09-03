import {serviceShiro} from "@/utils/request.js";


export function userLogin(body) {
    return serviceShiro({
        url: `/user/login`,
        method: 'post',
        data: body
    })
}

export function userIsLogin() {
    return serviceShiro({
        url: `/user/isLogin`,
        method: 'get',
    })
}

export function userLogout() {
    return serviceShiro({
        url: `/user/logout`,
        method: 'post',
    })
}

export function mUpdate(body) {
    return serviceShiro({
        url: `/user/m/update`,
        method: 'post',
        data: body
    })
}

// body: {colors}：预约日历卡片配色，状态码字符串 -> {bar, bg, text}。
// 整组覆盖（传 {} = 全部恢复默认），存当前账号的 yl_user.meta.calendarColors
export function mCalendarColor(body) {
    return serviceShiro({
        url: `/user/m/calendar-color`,
        method: 'post',
        data: body
    })
}

export function mPasswd(body) {
    return serviceShiro({
        url: `/user/m/passwd`,
        method: 'post',
        data: body
    })
}

export function mDetail() {
    return serviceShiro({
        url: `/user/m/detail`,
        method: 'get',
    })
}