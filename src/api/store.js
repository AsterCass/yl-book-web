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

