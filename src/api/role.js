import {serviceShiro} from "@/utils/request.js";


export function roleList(params) {
    return serviceShiro({
        url: `/role/list`,
        params: params,
        method: 'get',
    })
}

export function roleCreate(body) {
    return serviceShiro({
        url: `/role/create`,
        data: body,
        method: 'post',
    })
}

export function roleUpdate(id, body) {
    return serviceShiro({
        url: `/role/update/${id}`,
        data: body,
        method: 'post',
    })
}

export function roleDelete(id) {
    return serviceShiro({
        url: `/role/delete/${id}`,
        method: 'delete',
    })
}