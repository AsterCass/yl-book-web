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

// storeId 可选：总门店视角（未选定门店）下按数据行所属门店携带 X-Store-Id 调用
export function staffDetail(id, storeId) {
    return serviceShiro({
        url: `/staff/detail/${id}`,
        method: 'get',
        headers: storeId ? {'X-Store-Id': storeId} : undefined,
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

export function staffUpdateDisplayPriority(body) {
    return serviceShiro({
        url: `/staff/update/display-priority`,
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