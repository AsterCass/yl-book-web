import {serviceShiro} from "@/utils/request.js";


export function userLogin(body) {
    return serviceShiro({
        url: `/yui/user/login/v2`,
        method: 'post',
        data: body
    })
}