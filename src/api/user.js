import {serviceShiro} from "@/utils/request.js";

export function userLogin(body) {
    return serviceShiro({
        url: `/user/login`,
        method: 'post',
        data: body
    })
}

export function userLogout() {
    return serviceShiro({
        url: `/user/logout`,
        method: 'post',
    })
}