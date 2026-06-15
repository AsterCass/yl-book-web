import {serviceShiro} from "@/utils/request.js";


export function perList(params) {
    return serviceShiro({
        url: `/permission/list`,
        params: params,
        method: 'get',
    })
}

export function perCreate(body) {
    return serviceShiro({
        url: `/permission/create`,
        data: body,
        method: 'post',
    })
}

export function perUpdate(id, body) {
    return serviceShiro({
        url: `/permission/update/${id}`,
        data: body,
        method: 'post',
    })
}

export function perDelete(id) {
    return serviceShiro({
        url: `/permission/delete/${id}`,
        method: 'delete',
    })
}