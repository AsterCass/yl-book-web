import {serviceShiro} from "@/utils/request.js";

// 门店备忘录（前台便签墙）。权限复用预约域（book:book:*），故无需单独授权
export function memoList() {
    return serviceShiro({
        url: `/memo/list`,
        method: 'get',
    })
}

// body: {title, content, bgColor, textColor, posLeft, posTop}
export function memoCreate(body) {
    return serviceShiro({
        url: `/memo/create`,
        data: body,
        method: 'post',
    })
}

// body 同 create；只改内容与配色，位置不动
export function memoUpdate(id, body) {
    return serviceShiro({
        url: `/memo/update/${id}`,
        data: body,
        method: 'post',
    })
}

// body: {posLeft, posTop, layerNo}：拖动落位后回存，不带内容
export function memoPosition(id, body) {
    return serviceShiro({
        url: `/memo/position/${id}`,
        data: body,
        method: 'post',
    })
}

export function memoDelete(id) {
    return serviceShiro({
        url: `/memo/delete/${id}`,
        method: 'delete',
    })
}
