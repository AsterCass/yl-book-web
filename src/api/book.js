import {serviceShiro} from "@/utils/request.js";

export function bookList(params) {
    return serviceShiro({
        url: `/book/list`,
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

export function bookAssign(id, staffId) {
    return serviceShiro({
        url: `/book/assign/${id}`,
        params: {staffId: staffId},
        method: 'post',
    })
}

export function bookCancelAssign(id) {
    return serviceShiro({
        url: `/book/cancelAssign/${id}`,
        method: 'post',
    })
}
