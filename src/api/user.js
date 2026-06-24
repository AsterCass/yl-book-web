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