import {serviceShiro} from "@/utils/request.js";


export function staffSkillList(params) {
    return serviceShiro({
        url: `/staff/skill/list`,
        params: params,
        method: 'get',
    })
}

export function staffSkillListSimple() {
    return serviceShiro({
        url: `/staff/skill/list/simple`,
        method: 'get',
    })
}

export function staffSkillCreate(body) {
    return serviceShiro({
        url: `/staff/skill/create`,
        data: body,
        method: 'post',
    })
}

export function staffSkillUpdate(id, body) {
    return serviceShiro({
        url: `/staff/skill/update/${id}`,
        data: body,
        method: 'post',
    })
}

export function staffSkillDelete(id) {
    return serviceShiro({
        url: `/staff/skill/delete/${id}`,
        method: 'delete',
    })
}