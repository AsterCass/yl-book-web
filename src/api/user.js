import {serviceShiro} from "@/utils/request.js";

export function userList(params) {
    return serviceShiro({
        url: `/user/list`,
        params: params,
        method: 'get',
    })
}

export function userCreate(body) {
    return serviceShiro({
        url: `/user/create`,
        data: body,
        method: 'post',
    })
}

export function userUpdate(id, body) {
    return serviceShiro({
        url: `/user/update/${id}`,
        data: body,
        method: 'post',
    })
}

export function userUpdateRole(id, body) {
    return serviceShiro({
        url: `/user/update/${id}/role`,
        data: body,
        method: 'post',
    })
}

// body: {storeIdList}：目标应拥有的门店列表（仅限操作者自己拥有的门店；空数组=收回自己名下授予的全部）。
// 操作者与目标都须为租户级账号
export function userUpdateStore(id, body) {
    return serviceShiro({
        url: `/user/update/${id}/store`,
        data: body,
        method: 'post',
    })
}

export function userUpdateDisable(id, data) {
    return serviceShiro({
        url: `/user/update/${id}/disable`,
        params: data,
        method: 'post',
    })
}

export function userUpdateLock(id, data) {
    return serviceShiro({
        url: `/user/update/${id}/lock`,
        params: data,
        method: 'post',
    })
}

export function userDelete(id) {
    return serviceShiro({
        url: `/user/delete/${id}`,
        method: 'delete',
    })
}