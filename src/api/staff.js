import {serviceShiro} from "@/utils/request.js";

export function staffList(params) {
    return serviceShiro({
        url: `/staff/list`,
        params: params,
        method: 'get',
    })
}

export function staffListSimple() {
    return serviceShiro({
        url: `/staff/list/simple`,
        method: 'get',
    })
}

export function staffDetail(id) {
    return serviceShiro({
        url: `/staff/detail/${id}`,
        method: 'get',
    })
}

export function staffCreate(body) {
    return serviceShiro({
        url: `/staff/create`,
        data: body,
        method: 'post',
    })
}

export function staffUpdate(id, body) {
    return serviceShiro({
        url: `/staff/update/${id}`,
        data: body,
        method: 'post',
    })
}

export function staffUpdateSkill(id, body) {
    return serviceShiro({
        url: `/staff/update/${id}/skill`,
        data: body,
        method: 'post',
    })
}


export function staffDelete(id) {
    return serviceShiro({
        url: `/staff/delete/${id}`,
        method: 'delete',
    })
}