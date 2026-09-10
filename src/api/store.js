import {serviceShiro} from "@/utils/request.js";


export function storeList(params) {
    return serviceShiro({
        url: `/store/list`,
        params: params,
        method: 'get',
    })
}

export function storeDetail(id) {
    return serviceShiro({
        url: `/store/detail/${id}`,
        method: 'get',
    })
}

export function storeCreate(body) {
    return serviceShiro({
        url: `/store/create`,
        data: body,
        method: 'post',
    })
}

export function storeUpdate(id, body) {
    return serviceShiro({
        url: `/store/update/${id}`,
        data: body,
        method: 'post',
    })
}

/**
 * 测试门店的 ClassPass 账号密码是否可用。
 * 探测失败（密码错、对方不可达）返回 ok=false 而非 HTTP 错误码，需读 data.ok 判断。
 * 口令留空 = 用后端已保存的那份复验（管理端读不到已存口令）。
 */
export function classPassTestLogin(body) {
    return serviceShiro({
        url: `/classpass/test-login`,
        data: body,
        method: 'post',
    })
}
